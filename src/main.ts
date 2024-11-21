import express from "express";
import QRCode from "qrcode";
import { WechatyBuilder } from "wechaty";
import { ChatGPTBot } from "./chatgpt.js";

// 创建一个 Express 应用，监听 Render 的端口
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Wechaty ChatGPT Bot is running!");
});

app.listen(PORT, () => {
  console.log(`✅ HTTP server is listening on port ${PORT}`);
});

// Wechaty 实例
const weChatBot = WechatyBuilder.build({
  name: "my-wechat-bot",
});

// ChatGPTBot 实例
const chatGPTBot = new ChatGPTBot();

async function main() {
  weChatBot
    .on("scan", async (qrcode, status) => {
      const url = `https://wechaty.js.org/qrcode/${encodeURIComponent(qrcode)}`;
      console.log(`💡 Scan QR Code in WeChat to login: ${status}\n${url}`);
      console.log(
        await QRCode.toString(qrcode, { type: "terminal", small: true })
      );
    })
    .on("login", async (user: any) => {
      console.log(`✅ User ${user} has logged in`);
      chatGPTBot.setBotName(user.name());
      await chatGPTBot.startGPTBot();
    })
    .on("message", async (message: any) => {
      try {
        const msgDate = message.date();
        if (msgDate.getTime() <= chatGPTBot.startTime.getTime()) {
          return;
        }
        console.log(`📨 ${message}`);
        await chatGPTBot.onCustimzedTask(message);
        await chatGPTBot.onMessage(message);
      } catch (e) {
        console.error(`❌ ${e}`);
      }
    });

  try {
    await weChatBot.start();
  } catch (e) {
    console.error(`❌ Your Bot failed to start: ${e}`);
    console.log(
      "🤔 Can you login WeChat in browser? The bot works on the desktop WeChat"
    );
  }
}

main();
