const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092", "localhost:9093"],
});

let consumer;

const startConsumer = async groupId => {
  consumer = kafka.consumer({ groupId });
  await consumer.connect();
};

const subscribeConsumer = async (topic, cb) => {
  await consumer.subscribe({ topic, fromBeginning: true });
  consumer.run({
    eachMessage: cb,
  });
};

module.exports = {
  startConsumer,
  subscribeConsumer,
};
