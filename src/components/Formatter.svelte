<script lang="ts">
  import type { TreeNode } from '../mf2.js';

  interface Props {
    tree: TreeNode[];
    components?: Record<string, any>;
  }

  let { tree, components = {} }: Props = $props();
</script>

{#snippet renderNode(node: TreeNode)}
  {#if node.type === 'text'}
    {node.value}
  {:else if node.type === 'number'}
    {node.value}
  {:else if node.type === 'bidi'}
    <span dir="auto">{node.value}</span>
  {:else if node.type === 'markup'}
    {@const CustomComponent = components[node.tag]}
    {#if CustomComponent}
      <CustomComponent {...node.attributes}>
        {#each node.children as child}{@render renderNode(child)}{/each}
      </CustomComponent>
    {:else if node.tag === 'bold'}
      <b>{#each node.children as child}{@render renderNode(child)}{/each}</b>
    {:else if node.tag === 'italic'}
      <i>{#each node.children as child}{@render renderNode(child)}{/each}</i>
    {:else if node.tag === 'link'}
      {#if node.attributes.to || node.attributes.href}
        <a href={node.attributes.to || node.attributes.href}>
          {#each node.children as child}{@render renderNode(child)}{/each}
        </a>
      {:else}
        <!-- svelte-ignore a11y_missing_attribute -->
        <a style="text-decoration: underline">
          {#each node.children as child}{@render renderNode(child)}{/each}
        </a>
      {/if}
    {:else if node.tag === 'error'}
      <span style="color: red">
        {#each node.children as child}{@render renderNode(child)}{/each}
      </span>
    {:else if node.tag === 'star-icon'}
      ⭐
    {:else}
      <span>
        {#each node.children as child}{@render renderNode(child)}{/each}
      </span>
    {/if}
  {/if}
{/snippet}

{#each tree as node}
  {@render renderNode(node)}
{/each}