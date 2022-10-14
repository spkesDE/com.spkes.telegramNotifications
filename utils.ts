import {IncomingMessage} from "http";

export default class Utils {
    public static validateURL(link: string) {
        if (link.indexOf("http://") == 0) {
            return false;
        }
        return link.indexOf("https://") == 0;
    }

    public static async isImageValid(url: string) {
        let statusCode = await this.getStatusCode(url);
        return statusCode === 200;
    }

    public static async getStatusCode(url: string) {
        return new Promise((resolve, reject) => {
            const http      = require('http');
            const https     = require('https');
            let client = http;
            //Switch to HTTPS
            if (url.toString().indexOf("https") === 0)
                client = https;

            //Getting StatusCode
            client.get(url, (res: IncomingMessage) => {
                resolve(res.statusCode);
            }).on("error", (err: any) => {
                reject(err);
            });
        });
    }
}
