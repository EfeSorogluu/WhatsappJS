'use strict';

import axios from "axios";
import express from 'express';
import bodyParser from "body-parser";
import EventEmitter from 'events';

export class WhatsappJS extends EventEmitter {
    /**
     * 
     * @param {string} API_KEY 
     * @param {string} PHONE_NUMBER
     */
    constructor (API_KEY, PHONE_NUMBER) {
        super();
        this.client_key = API_KEY;
  
        this.client_phone = PHONE_NUMBER;
        this.client;
    }

    async start() {
        try {
            const request = await axios({
                method: 'GET',
                url: 'https://api.p.2chat.io/ping',
                headers: {
                    'X-User-API-Key': `${this.client_key}`,
                    'Content-Type': 'application/json'
                }
            });

            if(request.status == 200) {
                var data = '';

                var config = {
                    method: 'get',
                    url: 'https://api.p.2chat.io/open/whatsapp/get-numbers',
                    headers: { 
                        'X-User-API-Key': this.client_key
                    },
                    data : data
                };

                const res = await axios(config).catch(e => e);

                const number = res.data.numbers.filter(n => n.phone_number == this.client_phone)[0];

                this.emit('ready', number);
            } else {
                throw new Error(`Client cannot connect to servers.`);;
            }
        } catch (e) {
            throw new Error(`Some error on request.\n${error}`);
        }
    }

    /**
     * 
     * @param {WebhookConfig} config 
     * 
     */
    async webhookServer(config) {
        try {
            let path = config.path || new WebhookConfig().path;
            let port = config.port || new WebhookConfig().port;
            
            const app = express();

            app.use(bodyParser.json());
            app.use(bodyParser.text());
            app.use(bodyParser.urlencoded({ extended: true }));

            app.listen(port, () => {
                console.log(`🚀 Webhook server running on ${port}! Hook URL: ${config.host_name}${path}`);
            });

            const hooks = await this.getHooks();

            hooks.forEach(async (hook) => {
                let config = {
                    method: 'delete',
                    maxBodyLength: Infinity,
                    url: `https://api.p.2chat.io/open/webhooks/${hook.uuid}`,
                    headers: { 
                      'X-User-API-Key': this.client_key
                    },
                    data : ''
                };
                  
                axios.request(config)
                  .catch((error) => {
                    throw new Error(`Some error on request.\n${error}`);
                  });
            });

            setTimeout(() => {
                for (let i = 0; i < config.events.length; i++) {
                    const event = config.events[i];
                    
                    var data = JSON.stringify({
                        "hook_url": `${config.host_name}${path}`,
                        "on_number": this.client_phone,
                    });
    
                    var request_config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: `https://api.p.2chat.io/open/webhooks/subscribe/${event}`,
                        headers: { 
                          'X-User-API-Key': this.client_key, 
                          'Content-Type': 'application/json'
                        },
                        data : data
                    };
    
                    axios(request_config)
                        .catch(e => {
                            console.error(e);
                        });
                }
            }, 1500)

            app.post(path, (req, res) => {
                let data = req.body;

                if (data.sent_by == 'user') {
                    /**
                     * @type {Message}
                     */
                    const eventData = new Message(data, this.client_key);
                    this.emit('message', eventData);
                } else if(data.sent_by == 'api') {
                    /**
                     * @type {SentMessageEventData}
                     */
                    const eventData = {
                        id: data.id,
                        uuid: data.uuid,
                        created_at: data.created_at,
                        session_key: data.session_key,
                        message: data.message,
                        sended_phone_number: data.remote_phone_number,
                        client_phone_number: data.channel_phone_number,
                        sent_by: data.sent_by 
                    };
                    this.emit('sent_message', eventData);
                }

                res.sendStatus(200);
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * 
     * @param {Types.ReceiverPhone} to 
     * @param {Types.MessageContentText} text 
     */
    async sendMessage(to, text) {
        var data = JSON.stringify({
            "to_number": to,
            "from_number": this.client_phone,
            "text": text
          });
          
        var config = {
            method: 'post',
            url: 'https://api.p.2chat.io/open/whatsapp/send-message',
            headers: { 
              'X-User-API-Key': this.client_key, 
              'Content-Type': 'application/json'
            },
            data : data
        };
          
        axios(config)
          .catch(function (error) {
            throw new Error(`Some error on request.\n${error}`);
          });
    }

    /**
     * 
     * @param {Types.PhoneNumber} phone_number 
     * @returns 
     */
    async checkNumber(phone_number) {
        var config = {
            method: 'get',
            url: `https://api.p.2chat.io/open/whatsapp/check-number/${this.client_phone}/${phone_number}`,
            headers: { 
              'X-User-API-Key': this.client_key
            }
        };
        
        try {
            const res = await axios(config);
        
            if(!res.data.is_valid) {
                return "Invalid phone number!";
            } else if(!res.data.on_whatsapp) {
                return false;
            } else {
                return res.data;
            }
        } catch (e) {
            console.error(e);
        }
    }

    async getHooks() {
        var data = '';

        var config = {
            method: 'get',
            url: 'https://api.p.2chat.io/open/webhooks',
            headers: { 
                'X-User-API-Key': this.client_key
            },
            data : data
        };

        const res = await axios(config);

        return res.data.webhooks;
    }
}

export const Events = {
    CallReceived            : "whatsapp.call.received",
    NewMessage              : "whatsapp.message.new",
    MessageReceived         : "whatsapp.message.received",
    MessageSent             : "whatsapp.message.sent",
    NewConversation         : "whatsapp.conversation.new",
    AudioTranscribed        : "whatsapp.audio.transcribed",
    GroupMessageReceived    : "whatsapp.group.message.received",
    GroupJoin               : "whatsapp.group.join",
    GroupLeave              : "whatsapp.group.leave",
    GroupRemove             : "whatsapp.group.remove"
};

export class WebhookConfig {
    port        = 3000;
    path        = "/webhooks/whatsapp";
    host_name   = "required";
    events      = [];
};

export class Types {
    /**
     * @description Receiver phone number.
     */
    ReceiverPhone = "0";
    /**
     * @description Message content.
     */
    MessageContentText = "String";
    /**
     * @description 10 Digits phone number with country code
     */
    PhoneNumber = "String";
};

export class Message extends WhatsappJS {
    constructor(data, API_KEY) {
        super();
        this.client_key = API_KEY;

        this.id = data.id;
        this.uuid = data.uuid;
        this.created_at = data.created_at;
        this.session_key = data.session_key;
        this.message = {
            text: data.message.text,
            media: {
                url: data.message.media ? data.message.media.url : null,
                type: data.message.media ? data.message.media.type : null,
                mime_type: data.message.media ? data.message.media.mime_type : null,
            },
        };
        this.sender_phone_number = data.remote_phone_number;
        this.client_phone_number = data.channel_phone_number;
        this.sent_by = data.sent_by;
    }

    async reply(content) {
        var data = JSON.stringify({
            to_number: this.sender_phone_number,
            from_number: this.client_phone_number,
            text: content,
        });

        var config = {
            method: 'post',
            url: 'https://api.p.2chat.io/open/whatsapp/send-message',
            headers: {
                'X-User-API-Key': this.client_key,
                'Content-Type': 'application/json',
            },
            data: data,
        };

        axios(config).catch(function (error) {
            throw new Error(`Some error on request.\n${error}`);
        });
    }
}