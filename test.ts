import * as Ackee from ".";

const attributes = Ackee.attributes(true);
const attributes2 = Ackee.attributes(false);
const attributes3 = Ackee.attributes();

const instance = Ackee.create({
  server: "",
  domainId: "",
});

const stop = instance.record(attributes);

stop();

const stop2 = instance.record();

stop2();

const instance2 = Ackee.create(
  {
    server: "",
    domainId: "",
  },
  {
    ignoreLocalhost: false,
    detailed: true,
  }
);
