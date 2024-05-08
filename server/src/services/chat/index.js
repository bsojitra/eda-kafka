const producer = require("../../base/producer");
const consumer = require("../../base/consumer");

const initialize = async () => {
  await producer.startProducer();
  await consumer.startConsumer("send-chat-group");

  await consumer.subscribeConsumer(
    "send-chat-topic",
    async ({ topic, partition, message }) => {
      // TODO: we might need to pass extra params with message
      // ex.: abusive word filteration

      const args = JSON.parse(message.value.toString());
      // TODO: add messages to mongodb

      await producer.sendMsg("receive-chat-topic", [
        {
          value: message.value.toString(),
        },
      ]);
    }
  );
};

module.exports = { initialize };
