import Chat from './chat';
import Question from './question';
import fetch from 'node-fetch';

interface ChatAutocompletion {
    name: string;
    description: string;
    id: number;
}

interface TopicAutocompletion extends ChatAutocompletion {
    topic: number;
}

export default class Utils {
  public static validateURL(link: string) {
    if (link.indexOf('http://') == 0) {
      return false;
    }
    return link.indexOf('https://') == 0;
  }

  public static async isImageValid(url: string) {
    const statusCode = await this.getStatusCode(url);
    return statusCode === 200;
  }

  public static async getStatusCode(url: string) {
    const res = await fetch(url);
    return res.status;
  }


  public static userAutocomplete(users: Chat[], query: string, opts?: {
        skipTopics?: boolean,
    }) {
    const results: (ChatAutocompletion | TopicAutocompletion)[] = [];
    users.forEach((chat) => {
      let type = 'Unknown';
      //0 Chat, 1 Group, 2 Supergroup
      if (chat.type != undefined) {
        if (chat.type == 0) {
          type = 'User';
        } else if (chat.type == 1) {
          type = 'Group';
        } else if (chat.type == 2) {
          type = 'Supergroup';
        }
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
    return results.filter((result) => {
      return result.name.toLowerCase().includes(query.toLowerCase());
    });
  }

  public static topicAutocomplete(users: Chat[], query: string) {
    const results: TopicAutocompletion[] = [];
    users.forEach((chat) => {
      if (chat.topics && chat.topics.length > 0) {
        chat.topics.forEach((topic) => {
          results.push({
            name: topic.topicName,
            description: `➡️ ${chat.chatName}`,
            id: chat.chatId,
            topic: topic.topicId
          });
        });
      }
    });
    return results.filter((result) => {
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
        id: question?.buttons.indexOf(answer)
      });
    });
    return results.filter((result: { name: string, id: number }) => {
      return result.name.toLowerCase().includes(query.toLowerCase());
    });
  }
}
