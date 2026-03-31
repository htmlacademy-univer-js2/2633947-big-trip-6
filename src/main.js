/* eslint-disable */
// Простой тест для проверки Babel
const testConst = 'Hello World';
console.log(testConst);

const arrowTest = (value) => {
  return value;
};
console.log(arrowTest('Arrow function test'));

class SimpleClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Greetings from ${this.name}`);
  }
}

const obj = new SimpleClass('Babel');
obj.greet();
