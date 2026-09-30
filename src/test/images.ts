import type { TestInstance } from 'test-renderer';

type ImageSource = { uri: string };

/**
 * The TMDb file paths of the images drawn inside an element, such as "/dune.jpg" for a genre tile that
 * shows that backdrop. An image is decoration to a screen reader, so no role or label finds it.
 */
export function imagePathsIn(element: TestInstance): string[] {
  return element
    .queryAll((node) => Array.isArray(node.props.source))
    .flatMap((image) => image.props.source as ImageSource[])
    .map((source) => source.uri.replace(/^.*\/t\/p\/\w+/, ''));
}
