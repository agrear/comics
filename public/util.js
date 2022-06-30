const crypto = require('crypto');
const FileType = require('file-type');
const Fuse = require('fuse.js');
const parse5 = require('parse5');
const sizeOf = require('image-size');
const { nanoid } = require('nanoid');
const normalizeUrl = require('normalize-url');

function computeChecksum(algorithm, buffer) {
  return crypto.createHash(algorithm).update(buffer).digest('hex');
}

function createId() {
  return nanoid();
}

function findBestMatchingNeighbors(node, neighbors) {
  // Presort by url
  const sortedNeighbors = neighbors.sort((a, b) => (
    a.url.localeCompare(b.url)
  ));

  const options = {
    findAllMatches: true,
    keys: ['url'],
    threshold: 0.6
  };

  // Sort neighbors by closest match to node's url
  const fuse = new Fuse(sortedNeighbors, options);
  return fuse.search(node.url).map(({ item }) => item);
}

function parse(html, baseUrl) {
  const images = [];
  const links = [];
  const inlineFrames = [];

  function parseChildNode(childNode) {
    const attributes = childNode.attrs;

    switch (childNode.tagName) {
      case 'a':
        const link = {
          href: undefined,
          classes: undefined,
          rel: undefined,
          content: undefined
        };

        attributes.forEach(attribute => {
          switch (attribute.name) {
            case 'href':
              link.href ??= attribute.value;
              break;
            case 'class':
              link.classes ??= attribute.value;
              break;
            case 'rel':
              link.rel ??= attribute.value;
              break;
            default:
              break;
          }
        });

        if (link.href === undefined) {
          break;
        }

        // Stringify links content
        const content = childNode.childNodes.reduce((content, node) => (
          content + parse5.serialize(node)
        ), '');

        if (content !== '') {
          link.content = content;
        }

        // Normalize URL
        link.href = normalizeUrl(new URL(link.href, baseUrl).href, {
          stripHash: true
        });

        links.push(link);

        break;
      case 'img':
        for (const attribute of attributes) {
          if (attribute.name === 'src') {
            images.push({ src: new URL(attribute.value, baseUrl).href });
            break;
          }
        }

        break;
      case 'iframe':
        for (const attribute of attributes) {
          if (attribute.name === 'src') {
            inlineFrames.push({ src: new URL(attribute.value, baseUrl).href });
            break;
          }
        }

        break;
      default:
        break;
    }

    if (childNode.childNodes !== undefined) {
      childNode.childNodes.forEach(parseChildNode);
    }
  }

  const document = parse5.parse(html);
  document.childNodes.forEach(parseChildNode);

  return {
    url: normalizeUrl(baseUrl, { stripHash: true }),
    images,
    links,
    inlineFrames
  };
}

async function parseImage(buffer) {
  return {
    type: await FileType.fromBuffer(buffer).mime,
    ...sizeOf(buffer),
    sha256: computeChecksum('sha256', buffer),
    data: Buffer.from(buffer).buffer
  };
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toDate(seconds) {
  return new Date(seconds * 1000);
}

function toUTC(date) {
  return Math.floor(date.getTime() / 1000);
}

module.exports = {
  computeChecksum,
  createId,
  findBestMatchingNeighbors,
  parse,
  parseImage,
  randomInteger,
  toDate,
  toUTC
};
