<script>
  import { count } from '../counterStore';

  // Starting number
  export let start = 0;

  // Set state
  count.set(start);

  const add = () => {
    count.set($count + 1);
  };
  const subtract = () => {
    count.set($count - 1);
  };
</script>

<p>{$count}</p>

<button on:click={add}>+</button>
<button on:click={subtract}>-</button>
