import { Component } from '@angular/core';
import * as signalR from "@microsoft/signalr";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'signar-client';
  apiPath = '';
  messages = '';
  channel: string = '';
  channels: string[] = [];

  msg = '';
  channelSend = '';
  private conn: signalR.HubConnection;
  public get connectionId() {
    if(this.conn)
      return this.conn.connectionId;
    return 'Unknow';
  }
  public async tryConnect() {
    if (this.conn) {
      try {
        await this.conn.stop();
      } catch (e) {
        console.log(e);
      }
    }
    this.conn = new signalR.HubConnectionBuilder().withUrl(this.apiPath).build();
    try {
      await this.conn.start();
      this.channels = [];
      this.messages = '';
    } catch (e) {
      alert(e);
      this.conn = null;
    }
  }
  public async tryDisconnect() {
    if (!this.conn)
      return;
    try {
      await this.conn.stop();
    } catch (e) {
      alert(e);
    }
  }
  public listenChannel() {
    const channel = this.channel;
    if (this.channels.indexOf(channel) != -1 || !this.conn)
      return;
    this.channels.push(channel);
    this.conn.on(channel, (...args) => {
      let msg = `[${channel}]: \n`;
      args.forEach((arg, i) => {
        msg += `[arg${i}]: ${arg}\n`;
      });
      msg += `[${channel}]: EOF\n`;
      this.messages += msg;
    });
    this.channel = '';
  }
  public removeChannel(channel: string) {
    let idx = this.channels.indexOf(channel);
    if (idx == -1 || !this.conn)
      return;
    this.conn.off(channel);
    this.channels.splice(idx, 1);
    this.channels = this.channels.slice(0);
  }
  public async trySend(){
    if(!this.conn)
      return;
    await this.conn.send(this.channelSend, this.msg);
    this.msg = '';
  }
}