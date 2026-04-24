import {IncomingMessage, request as httpRequest} from "http";
import {request as httpsRequest} from "https";
import Chat from "./chat";
import Question from "./question";

export default class Utils {
    public static validateURL(link: string): boolean {
        try {
            const url = new URL(link);
            const hostname = url.hostname;

            const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
            const isPrivateIP = /^10\./.test(hostname) ||
                /^192\.168\./.test(hostname) ||
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

            const isInternalHostname = /^[^.\s]+$/.test(hostname) || hostname.endsWith(".local");

            if (url.protocol === "https:") {
                return true;
            }
            return url.protocol === "http:" && (isLocalhost || isPrivateIP || isInternalHostname);
        } catch (e) {
            return false;
        }
    }

    public static ensureValidRemoteUrl(url: string): string {
        if (!this.validateURL(url)) {
            throw new Error(
                `Invalid media URL "${url}". Allowed are HTTPS URLs and internal HTTP URLs such as localhost, private IPs, or .local hosts.`
            );
        }
        return url;
    }

    public static async isImageValid(url: string): Promise<boolean> {
        try {
            const statusCode = await this.getStatusCode(url);
            return statusCode >= 200 && statusCode < 400;
        } catch (e) {
            return false;
        }
    }

    public static async getStatusCode(url: string, redirectsLeft = 5): Promise<number> {
        return new Promise((resolve, reject) => {
            const target = new URL(url);
            const client = target.protocol === "https:" ? httpsRequest : httpRequest;
            const req = client(target, {method: "HEAD"}, async (res: IncomingMessage) => {
                const statusCode = res.statusCode ?? 0;
                const location = res.headers.location;
                if (location && statusCode >= 300 && statusCode < 400 && redirectsLeft > 0) {
                    res.resume();
                    try {
                        resolve(await this.getStatusCode(new URL(location, target).toString(), redirectsLeft - 1));
                    } catch (err) {
                        reject(err);
                    }
                    return;
                }
                res.resume();
                resolve(statusCode);
            });

            req.setTimeout(5000, () => {
                req.destroy(new Error(`Request timed out while checking "${url}"`));
            });
            req.on("error", (err: unknown) => {
                reject(err);
            });
            req.end();
        });
    }

    public static userAutocomplete(users: Chat[], query: string, opts?: {
        skipTopics?: boolean,
    }) {
        const results: any[] = [];
        users.forEach((chat) => {
            let type = "Unknown";
            if (chat.type != undefined) {
                if (chat.type == 0) type = "User";
                else if (chat.type == 1) type = "Group";
                else if (chat.type == 2) type = "Supergroup";
            }
            results.push({
                name: chat.chatName,
                description: type,
                id: chat.chatId,
            });
        });
        if (!opts || !opts.skipTopics) {
            const topics = this.topicAutocomplete(users, query);
            results.push(...topics);
        }
        return results.filter((result: any) => {
            return result.name.toLowerCase().includes(query.toLowerCase());
        });
    }

    public static topicAutocomplete(users: Chat[], query: string) {
        const results: any[] = [];
        users.forEach((chat) => {
            if (chat.topics && chat.topics.length > 0) {
                chat.topics.forEach((topic) => {
                    results.push({
                        name: topic.topicName,
                        description: `-> ${chat.chatName}`,
                        id: chat.chatId,
                        topic: topic.topicId
                    });
                });
            }
        });
        return results.filter((result: any) => {
            return result.name.toLowerCase().includes(query.toLowerCase());
        });
    }

    public static questionAutocomplete(questions: Question[], query: string) {
        const results: { name: string, id: string }[] = [];
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
        const results: { name: string, id: number }[] = [];
        question.buttons.forEach((answer) => {
            results.push({
                name: answer,
                id: question.buttons.indexOf(answer)
            });
        });
        return results.filter((result: { name: string, id: number }) => {
            return result.name.toLowerCase().includes(query.toLowerCase());
        });
    }
}
