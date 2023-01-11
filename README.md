# Starchart Studio

Starchart Studio is a tool to create component stories, similar to [Storybook](https://storybook.js.org/), but designed with [JavaScript islands](https://jasonformat.com/islands-architecture/) and static site generators in mind and powered by [Astro](https://astro.build/).

**This is a preview release!** It's enough to get going with but the UX and DX still needs some work. If you wanna help, please file an issue and we can chat!

## Get started

Start by installing [Astro MDX ](https://docs.astro.build/en/guides/integrations-guide/mdx/), then install this module:

```
npm install starchart-studio
```

Next, determine what folder you want to keep your stories in. Stories are MDX files that export information for Starchart Studio to build your story from as well as your long-form documentation. `src/stories` is a good option, but it can be anywhere. A story looks like this (using Astro's starter Card component):

```mdx
import Card from '../components/Card.astro';

export const story = {
  title: 'Card',
  component: Card,
  props: [
    {
      name: 'title',
      type: 'text',
      default: 'Card Title',
      description: 'The title of the card',
    },
    {
      name: 'body',
      type: 'text',
      default: 'Card Body',
      description: 'The body of the card',
    },
    {
      name: 'href',
      type: 'url',
      default: 'https://example.com',
    },
  ],
};

This is Astro's default card component! It's a list item that links to a URL and has a title and body text.
```

Your story needs to export a `story` object with the following properties:

- `title` - The title of your story
- `component` - The imported component for your story.
- `props` (optional) - The properties to pass to your component. Each property needs a `name` (the property name) and a `type` that corresponds to an HTML input type. It can also optionally have a `default` which will be passed in, a `description` of the property, and a `label` to describe the property. Properties get passed in at render time, so cannot be changed once rendered.
- `state` (optional) - State that affects your component. State and props share a structure. Hooking up state is a little more complex and is covered below.

Next, create a page (in your Astro `src/pages` directory) to generate the stories in. It can be in whatever folder structure or filename you want, as long as the filename ends in `[story]` for each story to be properly generated (for instance `style-guide/[story].astro`, `stories-[story].astro`). The generated page will replace `[story]` with the filename (minus `.mdx`) of your story. Right now, we recommend a flat folder structure in your stories directory. Once that file is created, add the following to it:

```astro
---
import Starchart from 'starchart-studio/Starchart.astro';
import { StarchartStudio } from 'starchart-studio';

/**
 * Builds static paths for stories
 * @return {Promise<{params: Object, props: Object}[]>}
 */
export async function getStaticPaths() {
  // Pass in the glob to your stories
  return StarchartStudio.getStaticPaths(Astro.glob('../../stories/*.mdx'));
}

// Chart out your components
const starchart = StarchartStudio.chart(Astro);
---

<!-- Render your Starchart -->
<Starchart {...starchart} />
```

This will generate unique pages for each story, including stand-alone components for previewing. You can style the page with global CSS, or you can grab the individual sub-components and render them yourself.

## State and Client Loading

If you need your component to load on the client, or you want to pass state, you're going to need to create a wrapper component as [dynamic elements can't be hydrated](https://docs.astro.build/en/core-concepts/astro-components/#dynamic-tags). Doing so can be as simple as creating an Astro component like so:

```astro
---
import Counter from '../components/Counter.svelte';

export interface Props {
  start: number;
}

const { start } = Astro.props;
---

<Counter start={start} client:load />
```

Here we've created a file `src/stories/counter.astro` that takes in the same properties as our component (to let us pass properties down), imported our Counter component, and rendered it, passing in the prop and loading it. We then use this component instead of our counter component directly in our story.

If we want to control our component's state, we start by doing this, then we need to add a little script to let Starchart Studio know how to manage state:

```html
<script>
  import { Starchart } from '@starchart/Starchart';

  // Import your state manager or store here to use with this component
  import { count } from '../../counterStore';

  // Create a new starchart instance for this component. Use the name of your story here (this would be for counter.mdx)
  const starchart = new Starchart('counter');

  // This will fire whenever any state update for counter comes in from Starchart, in the form of an object with name: value pairs
  starchart.onUpdate((data) => {
    console.log(data);
  });

  // This will fire only when an update to the 'count' state comes in from Starchart. You'll get the value
  starchart.onUpdateTo('count', (data) => {
    // Here you update state according to your state manager
    count.set(Number(data));
  });

  // You can also go in the other direction. Here we're subscribing to state changes and telling Starchart to update the 'count' state with the provided value, letting state changes work in both directions
  count.subscribe((value) => {
    starchart.send('count', value);
  });
</script>
```

This uses Astro's [script bundling](https://docs.astro.build/en/guides/client-side-scripts/#script-bundling) to let you listen for changes sent from Starchart so you can update your component's state, and even lets you update Starchart's state input when state in your component changes! Remember, [sharing state](https://docs.astro.build/en/core-concepts/sharing-state/) in an islands architecture is different than in single-page apps, so you may need to reconsider how you manage state.

## Features

<video src="https://media.mas.to/masto-public/media_attachments/files/109/600/305/812/185/840/original/c1be52a89c8f86ac.mp4" role="button" tabindex="0" aria-label="Screen recording of Astro-powered story tool in action. Starts with a card component, shows what props are available for the component, a description of the component, and a preview of the component in an iFrame, which is shown being resized on drag. Next switches to a counter component that shows both props and state, which is updated as the component is changed and when the state form item is changed." title="Screen recording of Astro-powered story tool in action. Starts with a card component, shows what props are available for the component, a description of the component, and a preview of the component in an iFrame, which is shown being resized on drag. Next switches to a counter component that shows both props and state, which is updated as the component is changed and when the state form item is changed." loop="" autoplay="" playsinline="" style="position: static; top: 0px; left: 0px;"></video>

Starchart will automatically build out the menu of components for you, hook up properties and send and listen for state changes, and render your stories into a nice display. It'll also create an isolated environment for each component preview that's resizable.

## Acknowledgements

Icons are from [Google Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols) licensed under the Apache 2.0 license and modified to swap height and width for `viewBox`.

Component resize area is heavily influenced by [ish.](https://github.com/bradfrost/ish.).
