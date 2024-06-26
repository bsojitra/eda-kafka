const { Kafka, Partitioners } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092", "localhost:9093"],
});

const producer = kafka.producer({
  createPartitioner: () => {
    return ({ topic, partitionMetadata, message }) => {
      return 0;
    };
  },
});

const startProducer = async () => {
  await producer.connect();
};

const stopProducer = async () => {
  await producer.disconnect();
};

const sendMsg = async (topic, messages) => {
  await producer.send({
    topic,
    messages,
  });
};

module.exports = {
  startProducer,
  stopProducer,
  sendMsg,
};
