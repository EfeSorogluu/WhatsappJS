import axios from "axios";
import express from 'express';
import bodyParser from "body-parser";
import EventEmitter from 'events';

export class WhatsappJS extends EventEmitter {
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

    async webhookServer(config) {
        try {
            if(config.events.length <= 0) throw new Error("Please include one or more event!");
            let path = config.path || new WebhookConfig().path;
            let port = config.port || new WebhookConfig().port;
            
            const app = express();

            app.use(bodyParser.json());
            app.use(bodyParser.text());
            app.use(bodyParser.urlencoded({ extended: true }));

            if(config.public) {
                if(!config.public.path || !config.public.name) throw new Error("Webhook public path and name required!");

                app.use(config.public.name, express.static(config.public.path))
            }

            app.listen(port, () => {
                console.log(`🚀 Webhook server running on ${port}! Webhook URL: ${config.host_name}${path}`);
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
                    const eventData = new Message(data, this.client_key, this.client_phone);
                    this.emit('message', eventData);
                } else if(data.sent_by == 'api') {
                    this.emit('sent_message', new Message(data, this.client_key, this.client_phone));
                }

                res.sendStatus(200);
            });
        } catch (e) {
            console.error(e);
        }
    }

    async sendMessage(to, text, options) {
        var data = {
            "to_number": to,
            "from_number": this.client_phone,
            "text": text
          }

        if (options && options.file_url) {
            data.url = options.file_url;
        }
          
        var config = {
            method: 'post',
            url: 'https://api.p.2chat.io/open/whatsapp/send-message',
            headers: { 
              'X-User-API-Key': this.client_key, 
              'Content-Type': 'application/json'
            },
            data : JSON.stringify(data)
        };
          
        axios(config)
          .catch(function (error) {
            throw new Error(`Some error on request.\n${error}`);
          });
    }

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

export class Message extends WhatsappJS {
    constructor(data, API_KEY, PHONE) {
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


    async reply(content, options) {
        var data = {
            to_number: this.sender_phone_number,
            from_number: this.client_phone_number,
            text: content,
        };

        // Eğer options içinde file_url varsa, data nesnesine url ekleyin
        if (options && options.file_url) {
            data.url = options.file_url;
        }

        var config = {
            method: 'post',
            url: 'https://api.p.2chat.io/open/whatsapp/send-message',
            headers: {
                'X-User-API-Key': this.client_key,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data), // data nesnesini JSON.stringify ile dönüştürün
        };

        try {
            await axios(config);
        } catch (error) {
            console.log(error.request.data)
            throw new Error(`Some error on request.\n${error}`);
        }
    }

    async sendMessage(to, text, options) {
        var data = {
            "to_number": to,
            "from_number": this.client_phone,
            "text": text
          }

        if (options && options.file_url) {
            data.url = options.file_url;
        }
          
        var config = {
            method: 'post',
            url: 'https://api.p.2chat.io/open/whatsapp/send-message',
            headers: { 
              'X-User-API-Key': this.client_key, 
              'Content-Type': 'application/json'
            },
            data : JSON.stringify(data)
        };
          
        axios(config)
          .catch(function (error) {
            throw new Error(`Some error on request.\n${error}`);
          });
    }

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
}