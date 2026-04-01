// Простой тестовый код
const message = 'Big Trip App Started';
console.log(message);

// Стрелочная функция
const arrowFunc = () => {
  console.log('Arrow function works!');
};
arrowFunc();

// Класс
class TestClass {
  constructor(name) {
    this.name = name;
  }
  
  sayHello() {
    console.log('Hello from ' + this.name);
  }
}

const test = new TestClass('Babel');
test.sayHello();
