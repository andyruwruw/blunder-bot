// 

let thing = {
  1: {
    id: 'hello',
    data: 'wrong',
  },
  2: {
    id: 'there',
    data: 'wrong',
  },
  3: {
    id: 'mr',
    data: 'wrong',
  },
  4: {
    id: 'find',
    data: 'right',
  },
};

console.log((await thing.find(c => c.id == 'find')).data);

