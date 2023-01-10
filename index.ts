import { basename } from 'path';

import type { StarchartControl } from './src/starchart/StarchartControls.astro';
import type { MDXInstance, ComponentFactory, AstroGlobal } from 'astro/types';

export type StarchartStaticPath = {
  params: {
    story: string;
  };
  props: {
    title: string;
    Content: ComponentFactory;
    controls: Array<StarchartControl>;
    props: Array<StarchartControl>;
  };
};

/**
 * Studio helper class
 */
class Studio {
  _stories: Array<StarchartStaticPath>;

  /**
   * Builds Starchart static paths
   * @param {Promise<MDXInstance>} glob - Astro glob
   * @return {Promise<Array<StarchartStaticPath>>}
   */
  async getStaticPaths(glob: Promise<MDXInstance[]>) {
    const stories = await glob;

    const paths = stories.map((story) => [
      {
        params: {
          story: basename(story.file, '.mdx'),
        },
        props: {
          title: story.story.title,
          Content: story.Content,
          controls: story.story.state || [],
          props: story.story.props || [],
        },
      },
      {
        params: {
          story: `${basename(story.file, '.mdx')}__inline`,
        },
        props: { ...story.story },
      },
    ]);

    this._stories = paths.flat();

    return this._stories;
  }

  /**
   * Builds story and component chart
   * @param {AstroGlobal} Astro - Astro global
   * @return {object} Starchart chart data
   */
  chart(Astro: AstroGlobal) {
    const { story: slug } = Astro.params;
    const {
      component: Component,
      title,
      Content,
      controls,
      stories,
      props,
    } = Astro.props;

    // Determine URL for all stories
    const { pathname } = Astro.url;
    let base =
      this._stories.find((story) => pathname.endsWith(story.params.story))
        ?.params?.story || null;
    if (base === null) {
      throw new Error('Could not find story');
    }
    base = pathname.replace(new RegExp(base + '$'), '[story]');
    const chart = this._stories
      .filter((s) => !s.params.story.endsWith('__inline'))
      .map((story) => ({
        title: story.props.title,
        url: base?.replace('[story]', story.params.story),
      }));

    const inline = slug.endsWith('__inline');

    const properties = inline
      ? Astro.props
      : { title, Content, slug, controls, stories, url: Astro.url, props };

    return {
      story: {
        inline,
        properties,
        Component,
        slug,
      },
      chart,
    };
  }
}

export const StarchartStudio = new Studio();
