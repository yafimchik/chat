const CONFIG = require("../configs/config");
const mongoose = require("mongoose");
const serviceFabric = require("../resources/service.fabric");

async function test() {
  await mongoose.connect(CONFIG.MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  let result;

  const vsService = serviceFabric.create('virtualServer');
  // result = await vsService.create({ _id: '6001d14d384b707a216a1e75', name: 'my third v-server'}); // true
  // result = await vsService.update('6001d14d384b707a216a1e75', { name: 'my fourth v-server'}); // true
  // result = await vsService.update(mongoose.Types.ObjectId('600194510d201c543e365544'), { name: 'my first first v-server'}); // true
  // result = await vsService.deleteById('60019747e26f2655ab95c953');
  // result = await vsService.deleteById('6001d14d384b707a216a1e75');// false
  // result = await vsService.getAll(); // true  _id возвращается в ObjectId
  // console.log(result[0]._id.toString());
  // result = await vsService.getWhere({ _id: '60019747e26f2655ab95c953'}); // true  поиск по строковому _id работает как часики, по id не работает
  // result = await vsService.getById(mongoose.Types.ObjectId('60019747e26f2655ab95c953')); // true _id в любом формате


  const userService = serviceFabric.create('user');

  // result = await userService.update('60019f2043c61b59ee76a863' ,{ username: 'jeka', virtualServers: ['60019757576dda55bbe9196c', null, null]});
  // result = await userService.create({ username: '1', virtualServers: ['60019757576dda55bbe9196c', null, null]}); // true
  // result = await userService.create({ username: '2', virtualServers: ['60019757576dda55bbe9196c', null, null]}); // true
  // result = await userService.getByLogin('jeka'); // true Метод crud описывать в конструкторе
  // (но если речь об изменении/удалении/создании данных, то лучше пользоваться стандартным crud методами)
  // Потому что тогда репозитория можно не учесть согласование связей таблиц


  const chatService = serviceFabric.create('chat');

  // result = await chatService.getWhere({ _id: '6001b1576c388d65b4b04a3c'}); // true
  // result = await chatService.create({name: 'second chat', virtualServer: '60019747e26f2655ab95c953'}); // true
  // result = await chatService.create({name: 'seventh chat', virtualServer: '70019757576dda55bbe9196c'}); // true
  // result = await chatService.getAll();
  // const mService = serviceFabric.create('message');
  // result = await mService.create({text: 'first message', chat: '7001b1576c388d65b4b04a3c', user: '70019f2043c61b59ee76a863'});
  // result = await mService.getWhere({ _id: '6001be9b6bbdde6d094d9d3f' });
  // result = await mService.create({text: 'first message', chat: '7001b1576c388d65b4b04a3c', user: '70019f2043c61b59ee76a863'});

  console.log(result);
  process.exit();
}

test();
