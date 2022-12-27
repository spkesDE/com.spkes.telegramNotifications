import {IncomingMessage} from "http";
import User from "./user";
import Question from "./question";

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
            const http = require('http');
            const https = require('https');
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

    public static userAutocomplete(users: User[], query: string) {
        const results: { name: string, id: number }[] = [];
        users.forEach((user) => {
            results.push({
                name: user.chatName,
                id: user.userId,
            });
        });
        return results.filter((result: { name: string, id: number }) => {
            return result.name.toLowerCase().includes(query.toLowerCase());
        });
    }

    public static questionAutocomplete(questions: Question[], query: string) {
        let results: { name: string, id: string }[] = [];
        questions.forEach((question) => {
            results.push({
                name: question.question,
                id: question.UUID,
            });
        });
        return results.filter((result: { name: string, id: string }) => {
            return result.name.toLowerCase().includes(query.toLowerCase());
        });
    }

    public static answerAutocomplete(question: Question, query: string) {
        let results: { name: string, id: number }[] = [];
        question.buttons.forEach((answer) => {
            results.push({
                name: answer,
                id: question?.buttons.indexOf(answer)
            })
        });
        return results.filter((result: { name: string, id: number }) => {
            return result.name.toLowerCase().includes(query.toLowerCase());
        });
    }
}
