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
  _vnav: Array<any>;

  /**
   * Builds Starchart static paths
   * @param {Promise<MDXInstance>} glob - Astro glob
   * @return {Promise<Array<StarchartStaticPath>>}
   */
  async getStaticPaths(glob: Promise<MDXInstance[]>) {
    const stories = await glob;

    const vnav = {
      key: {},
      siblings: {},
      stories: [],
    };

    const paths = stories.map((story) => {
      const variants = story.story.variants
        .map((variant, i) => {
          const suffix = i !== 0 ? `__variant-${i}` : '';
          const base = {
            title: story.story.title,
            variant:
              i !== 0 ? variant.title || `variant-${i}` : variant.title || '',
          };

          const keyBase = basename(story.file, '.mdx');
          const key = keyBase + suffix;

          if (i === 0) {
            vnav.siblings[keyBase] = [];
            vnav.stories.push(keyBase);
          }

          vnav.key[key] = keyBase;
          vnav.siblings[keyBase].push({
            title: base.title,
            variant: base.variant,
            url: key,
          });

          const v = [
            {
              params: {
                story: key,
              },
              props: {
                ...base,
                Content: story.Content,
                controls: variant.state || [],
                props: variant.props || [],
              },
            },
            {
              params: {
                story: `${key}__inline`,
              },
              props: {
                ...base,
                component: story.story.component,
                props: variant.props,
                state: variant.state,
              },
            },
          ];
          return v;
        })
        .flat();

      return variants;
    });

    this._vnav = vnav;

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
      variant: subtitle,
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
      .map((story) => {
        const key = this._vnav.key[story.params.story];
        const variants = this._vnav.siblings[key];
        if (variants.length > 1) {
          return {
            title: variants[0].title,
            url: variants[0].url,
            variants,
          };
        }

        return variants[0];
      })
      .filter((v, i, a) => a.findIndex((t) => t.url === v.url) === i);

    const inline = slug.endsWith('__inline');

    const properties = inline
      ? Astro.props
      : {
          title,
          subtitle,
          Content,
          slug,
          controls,
          stories,
          url: Astro.url,
          props,
        };

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
