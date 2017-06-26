# tiny-state

A tiny state-management library with minimal API

## How to install

`npm install --save tiny-state`

## How to include

CommonJS

```javascript
const createState = require('tiny-state');
```

ES6 modules (transpiled to CommonJS)

```javascript
import createState from 'tiny-state';
```

Directly in browser (will be global `createState` variable)

```html
<script src='/libs/tiny-state/index.js'></script>
```

## How to use

### Create state

```javascript
var state = createState({
  a: 100,
  b: 200
});
```

If nothing is passed to `createState`, it will just be an empty object.

### Subscribe to state

Once state is created, you can add subscribers to it:

```javascript
var calculate = function(state) {
  console.log(state.a + state.b);
}
state.subscribe(calculate);
```

Or, alternatively:

```javascript
var SomeObject = {
  c: 300,
  // this will allow us to preserve `this` word;
  // same will work with classes
  handleUpdate: function(state) {
    console.log(state.a + state.b + this.c);
  }
};
state.subscribe(SomeObject); // once state changes, `SomeObject.handleUpdate` will be called
```

### Change state

You can change state simply by calling `state.change`:

```javascript
state.change(function(state) {
  state.a = 400;
  state.b = 500;
  // or, change anything you want
});
```

This will trigger update of the subscribers, who are subscribed to `state`. So, both `calculate` and `SomeObject.handleUpdate` will be called after this.

If you don't want to trigger update of subscribers, you can just directly modify the state like so:

```javascript
state.a = 400;
state.b = 500;
```

### Unsubscribing from state

```javascript
state.unsubscribe(calculate);
```

Or:

```javascript
state.unsubscribe(SomeObject);
```

## Philosophy

Treat each state as a subscription point. Parts of your app may want to subscribe to different parts of the state. So, there's no shame in nesting states like so:

```javascript
var state = createState({
  someGlobal: createState({ value: 100 })
});
```

Different parts of your app might want to create state for themselves, and subscribe to some parts of the global state. Take this React example:

```javascript
// suppose this is some global in another file
state.c = createState({ value: 300 });

// and here's our React component
class MyApp extends React.Component {
  componentWillMount() {
    // creating own state
    state.MyApp = createState({
      a: 100,
      b: 200
    });
    state.MyApp.subscribe(this); // subscribing to own state
    state.c.subscribe(this); // subscribing to global state
  }

  // don't forget to unsubscribe before the component is discarded
  componentWillUnmount() {
    state.c.unsubscribe(this);
    state.MyApp.unsubscribe(this);
    delete state.MyApp; // no longer need to keep state.MyApp
  }

  // `handleUpdate` method for subscribing
  handleUpdate() {
    this.forceUpdate(); // This will trigger re-render
  }

  render() {
    return (
      <div>
        <div>Calculated Result: { state.MyApp.a + state.MyApp.b + state.c.value }</div>
        <button onClick={() => {
          state.MyApp.change((MyApp) => {
            MyApp.a += 100;
          })
        }}> Change state.MyApp.a </button>
      </div>
    )
  }
}
```

Note that we use `state.c.value`. We can't just use `state.c`, because `state.c` is a state that has to be an object, so that we can store subscribers within it.

If you need to, you can also see **who** modified the state within `handleUpdate`:

```javascript
  handleUpdate(state) {
    if(state === state.MyApp) {
      console.log('state.MyApp changed, do one kind of update');
    }
    else if(state === state.c) {
      console.log('state.c changed, do another kind of update');
    }
  }
```

## License

[MIT](https://github.com/guitarino/tiny-state/blob/master/LICENSE)