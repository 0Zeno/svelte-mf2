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

  const { t, locale: localeStore } = getContext('i18n');

  const currentLocale = $derived(locale || $localeStore || 'en');

  const result = $derived.by(() => {
    const translation = t(key, params, currentLocale);
    return translation || defaultValue || key;
  });

  const isTree = $derived(Array.isArray(result));
</script>

{#if isTree}
  <Formatter tree={result} {components} />
{:else}
  {result}
{/if}
