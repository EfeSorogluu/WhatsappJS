
  

## WhatsappJS is a library where you can create bots and answering machines using the 2Chat API!

  

## Installation

You can use yarn or npm module installers to download WhatsappJS module.

  

On NPM

```npm install @efesoroglu/whatsappjs```

  

On Yarn

```yarn add @efesoroglu/whatsappjs```

  

## Getting Started

  

- If you haven't already, you need to create a 2Chat account. You can do that [here](https://app.2chat.io/signup/).

- After finishing creating your account, you will need to connect a channel we support. You can do that in the [channels](https://app.2chat.io/channels) section.

- Finally, get an existing API key or create a new one to run the examples showcased in the tutorials. You can do that inside your [user profile on 2Chat](https://app.2chat.io/user).

![2Chat API Access Screen](https://developers.2chat.co/assets/images/2chat-api-access-faae4b2d9606aefc33b8d5ad5247956c.png)

  

Taken from 2Chat official API documentation. For more information, please visit [2Chat](https://2chat.co/).

  

## Starting your Client

  

To start your client, you first need to call the WhatsappJS class using your [2Chat API Key](https://app.2chat.io/) and your Channel phone number.

  

Below is an example:

  

```

import { WhatsappJS } from '@efesoroglu/whatsappjs'

  

const client = new WhatsappJS("<your-api-key>", "<channel-phone-number>");

  

client.start();

```

  

Finally, you can now listen for the ready event and see that your bot has started.

  

Below is an example:

  

```

import { WhatsappJS } from '@efesoroglu/whatsappjs'

const client = new WhatsappJS("<your-api-key>", "<channel-phone-number>");

client.once('ready', (client) => {
	console.log(`The bot started with the name ${client.client_name} (${client.phone_number})!`);
});

  

client.start();

```

  

## Webhook Listener

  

If you want to receive incoming and outgoing messages, you need to install Webhook Listener. We have listed the steps for this respectively:

  

- You need to obtain a tunnel address via NGROK. [How do I do it?](https://ngrok.com/)

- You need to call and configure the webhookServer class in the WhatsappJS class. 

An example is given below.

```

import { WhatsappJS } from '@efesoroglu/whatsappjs'

const client = new WhatsappJS("<your-api-key>", "<channel-phone-number>");

client.webhookServer({
	port: 8080,
	events: ["whatsapp.message.new"],
	host_name: "https://<your_sub>.ngrok-free.app",
});

  

client.once('ready', (client) => {
	console.log(`The bot started with the name ${client.client_name} (${client.phone_number})!`);
});

  

client.start();

```

## Public Directory Section

You can listen to the public folder by specifying a public object in the webhookListener function. With this feature, you can make your transfers from your public folder without requiring an additional intermediate server when sending images, files, etc. over whatsapp.

An example is given below.

```
import { WhatsappJS } from '@efesoroglu/whatsappjs'

  

const client = new WhatsappJS("<your-api-key>", "<channel-phone-number>");

client.webhookServer({
	port: 8080,
	events: ["whatsapp.message.new"],
	host_name: "https://<your_sub>.ngrok-free.app",
	public: {
		name: "/public" // this is public path on your hostname. For example: https://<your_sub>.ngrok-free.app/public
		path: "path/to/public/dir" // this is public files dir
	}
});
```

  

As you can see, the Events class is called and the Events in it are selected. You can take a look at [Documentation](https://whatsappjs.gitbook.io/docs/events) to learn which Event does what.