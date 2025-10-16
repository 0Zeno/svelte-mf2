<script lang="ts">
  import { getContext } from 'svelte';
  import Formatter from './Formatter.svelte';

  interface Props {
    key: string;
    params?: Record<string, any>;
    locale?: string;
    components?: Record<string, any>;
    default?: string;
  }

  let { key, params = {}, locale, components, default: defaultValue }: Props = $props();

  const context = getContext<{ t: any; l: any; locale: any }>('i18n');
  
  if (!context) {
    throw new Error('T component must be used within an i18n context');
  }
  
  const { t, l, locale: localeStore } = context;

  const currentLocale = $derived(locale || $localeStore || 'en');

  const result = $derived.by(() => {
    const translation = locale 
      ? l(currentLocale, key, params)
      : t(key, params);
    return translation || defaultValue || key;
  });

  const isTree = $derived(Array.isArray(result));
</script>

{#if isTree}
  <Formatter tree={result} {components} />
{:else}
  {result}
{/if}