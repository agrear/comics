const sizeOf = require('image-size');
const normalizeUrl = require('normalize-url');

const { computeChecksum, createId, toDate, toUTC } = require('./util');

function createPreparedStatements(db) {
  const deleteComic = db.prepare('DELETE FROM comic WHERE id = ?');

  const deletePage = db.prepare('DELETE FROM page WHERE id = ?');

  const deleteTag = db.prepare(`
    DELETE FROM tag WHERE comic_id = @comicId AND tag = @tag
  `);

  const deleteTags = (comicId, tags) => {
    tags.forEach(tag => deleteTag.run({ comicId, tag }));
  };

  const insertComic = db.prepare(`
    INSERT INTO comic (
      id,
      url,
      author,
      title,
      synopsis,
      cover_type,
      cover_width,
      cover_height,
      cover_data
    ) VALUES (
      @id,
      @url,
      @author,
      @title,
      @synopsis,
      @coverType,
      @coverWidth,
      @coverHeight,
      @coverData
    )
  `);

  const insertPage = db.prepare(`
    INSERT INTO page (
      id,
      number,
      url,
      image_src,
      image_type,
      image_sha256,
      image_width,
      image_height,
      image_data,
      comic_id
    ) VALUES (
      @id,
      @number,
      @url,
      @imageSrc,
      @imageType,
      @imageSha256,
      @imageWidth,
      @imageHeight,
      @imageData,
      @comicId
    )
  `);

  const insertTag = db.prepare(`
    INSERT INTO tag (comic_id, tag) VALUES (?, ?)
  `);

  const insertTags = (comicId, tags) => {
    tags.forEach(tag => insertTag.run(comicId, tag));
  };

  const selectBookmark = db.prepare(
    'SELECT bookmark FROM comic WHERE id = ?'
  ).pluck();

  const selectComic = db.prepare(`
    SELECT
      id,
      url,
      author,
      title,
      synopsis,
      bookmark,
      created,
      accessed,
      updated,
      brightness,
      page_fit,
      page_position,
      page_zoom,
      updates_enabled,
      update_interval,
      update_limit,
      cover_type,
      cover_width,
      cover_height,
      cover_data
    FROM comic
    WHERE id = ?
  `);

  const selectComics = db.prepare(`
    SELECT
      id,
      url,
      author,
      title,
      synopsis,
      bookmark,
      created,
      accessed,
      updated,
      brightness,
      page_fit,
      page_position,
      page_zoom,
      updates_enabled,
      update_interval,
      update_limit,
      cover_type,
      cover_width,
      cover_height,
      cover_data
    FROM comic
  `);

  const selectImage = db.prepare(`
    SELECT
      id,
      image_src,
      image_sha256,
      image_type,
      image_width,
      image_height,
      image_data
    FROM page WHERE id = ?
  `);

  const selectImageInfo = db.prepare(`
    SELECT
      image_src,
      image_sha256,
      image_width,
      image_height
    FROM page WHERE id = ?
  `);

  const selectNextPageNumber = db.prepare(`
    SELECT IFNULL(MAX(number) + 1, 0) FROM page WHERE comic_id = ?
  `).pluck();

  const selectPage = db.prepare(`
    SELECT id, number, url, accessed, modified, comic_id FROM page
    WHERE id = ?
  `);

  const selectPageIdByImageSha256 = db.prepare(`
    SELECT id FROM page WHERE image_sha256 = ?
  `).pluck();

  const selectPageIdByUrl = db.prepare(`
    SELECT id FROM page WHERE url = ?
  `).pluck();

  const selectPages = db.prepare(`
    SELECT id, number, url, accessed, modified, comic_id FROM page
    WHERE comic_id = ?
    ORDER BY number ASC
  `);

  const selectTags = db.prepare(
    'SELECT tag FROM tag WHERE comic_id = ?'
  ).raw();

  const updateAllPagesNotAccessed = db.prepare(`
    UPDATE page SET accessed = strftime('%s','now')
    WHERE comic_id = @comicId AND accessed IS NULL
  `);

  const updateBookmark = db.prepare(`
    UPDATE comic SET bookmark = @pageNumber WHERE id = @comicId
  `);

  const updateComic = db.prepare(`
    UPDATE comic
    SET url = @url, author = @author, title = @title, synopsis = @synopsis
    WHERE id = @comicId
  `);

  const updateComicAccessed = db.prepare(`
    UPDATE comic SET accessed = @accessed WHERE id = @comicId
  `);

  const updateComicBrightness = db.prepare(`
    UPDATE comic SET brightness = @brightness WHERE id = @comicId
  `);

  const updateComicCover = db.prepare(`
    UPDATE comic
    SET
      cover_type = @type,
      cover_width = @width,
      cover_height = @height,
      cover_data = @data
    WHERE id = @comicId
  `);

  const updateComicLayout = db.prepare(`
    UPDATE comic
    SET page_fit = @fit, page_position = @position, page_zoom = @zoom
    WHERE id = @comicId
  `);

  const updateComicUpdated = db.prepare(`
    UPDATE comic SET updated = @updated WHERE id = @comicId
  `);

  const updateComicUpdates = db.prepare(`
    UPDATE comic
    SET
      updates_enabled = @enabled,
      update_interval = @interval,
      update_limit = @limit
    WHERE id = @comicId
  `);

  const updateImage = db.prepare(`
    UPDATE page
    SET
      image_src = @src,
      image_type = @type,
      image_sha256 = @sha256,
      image_width = @width,
      image_height = @height,
      image_data = @data
    WHERE id = @pageId
  `);

  const updatePageAccessed = db.prepare(`
    UPDATE page SET accessed = @accessed WHERE id = @pageId
  `);

  const updatePageModified = db.prepare(`
    UPDATE page SET modified = (strftime('%s', CURRENT_TIMESTAMP))
    WHERE id = @pageId
  `);

  const updatePageNumber = db.prepare(`
    UPDATE page SET number = @number WHERE id = @pageId
  `);

  const updatePageNumbersHigher = db.prepare(`
    UPDATE page
    SET number = number - 1
    WHERE comic_id = @comicId AND number > @oldNumber AND number <= @number
  `);

  const updatePageNumbersLower = db.prepare(`
    UPDATE page
    SET number = number + 1
    WHERE comic_id = @comicId AND number >= @number AND number < @oldNumber
  `);

  const updatePageUrl = db.prepare(`
    UPDATE page SET url = @url WHERE id = @pageId
  `);

  function formatComic({
    id,
    url,
    author,
    title,
    synopsis,
    bookmark,
    created,
    accessed,
    updated,
    cover_type,
    cover_width,
    cover_height,
    cover_data,
    brightness,
    page_fit,
    page_position,
    page_zoom,
    updates_enabled,
    update_interval,
    update_limit
  }) {
    return {
      id,
      url,
      author,
      title,
      synopsis,
      tags: formatTags(selectTags.all(id)),
      cover: {
        type: cover_type,
        width: cover_width,
        height: cover_height,
        data: Buffer.from(cover_data)
      },
      bookmark,
      created: new toDate(created),
      accessed: accessed && toDate(accessed),
      updated: updated && toDate(updated),
      brightness,
      layout: {
        fit: page_fit,
        position: page_position,
        zoom: page_zoom
      },
      updates: {
        enabled: Boolean(updates_enabled),
        interval: update_interval,
        limit: update_limit
      },
      pages: selectPages.all(id).map(formatPage)
    };
  }

  function formatImage({ id, image_type, image_data, ...info }) {
    return {
      id,
      type: image_type,
      data: Buffer.from(image_data),
      ...formatImageInfo(info)
    };
  }

  function formatImageInfo({
    image_src,
    image_sha256,
    image_width,
    image_height
  }) {
    return {
      src: image_src,
      sha256: image_sha256,
      width: image_width,
      height: image_height
    };
  }

  function formatPage({
    id,
    number,
    url,
    accessed,
    modified,
    comic_id
  }) {
    return {
      id,
      url,
      number,
      accessed: accessed && toDate(accessed),
      modified: toDate(modified),
      comicId: comic_id
    };
  }

  function formatTags(tags) {
    return tags.flat();
  }

  return {
    deleteComic: comicId => deleteComic.run(comicId),
    deletePage: pageId => deletePage.run(pageId),
    insertComic: db.transaction(({ cover, meta: { url, tags, ...meta } }) => {
      const comicId = createId();

      const { width: coverWidth, height: coverHeight } = sizeOf(
        Buffer.from(cover.data)
      );

      insertComic.run({
        id: comicId,
        url: new URL(url).href,
        ...meta,
        coverType: cover.type,
        coverData: cover.data,
        coverWidth,
        coverHeight
      });

      insertTags(comicId, tags);

      return formatComic(selectComic.get(comicId));
    }),
    insertPage: (comicId, url, imageSrc, { data, type }) => {
      const pageId = createId();
      const number = selectNextPageNumber.get(comicId);
      const { width, height } = sizeOf(Buffer.from(data));

      insertPage.run({
        id: pageId,
        number,
        url,
        imageSrc: imageSrc,
        imageType: type,
        imageSha256: computeChecksum('sha256', data),
        imageWidth: width,
        imageHeight: height,
        imageData: data,
        comicId
      });

      return formatPage(selectPage.get(pageId));
    },
    selectBookmark: comicId => selectBookmark.get(comicId),
    selectComic: comicId => formatComic(selectComic.get(comicId)),
    selectComics: () => selectComics.all().map(formatComic),
    selectImage: pageId => formatImage(selectImage.get(pageId)),
    selectImageInfo: pageId => formatImageInfo(selectImageInfo.get(pageId)),
    selectPage: pageId => formatPage(selectPage.get(pageId)),
    selectPageIdByImageSha256: sha256 => selectPageIdByImageSha256.get(sha256),
    selectPageIdByUrl: url => selectPageIdByUrl.get(url),
    selectPages: comicId => selectPages.all(comicId).map(formatPage),
    updateAllPagesNotAccessed: comicId => {
      updateAllPagesNotAccessed.run({ comicId });
    },
    updateBookmark: (comicId, pageNumber) => {
      updateBookmark.run({ comicId, pageNumber });
    },
    updateComic: db.transaction((comicId, cover, { url, tags, ...meta }) => {
      updateComic.run({
        comicId,
        url: normalizeUrl(url, { stripHash: true }),
        ...meta
      });

      // Change tags
      const newTags = new Set(tags);
      const oldTags = new Set(formatTags(selectTags.all(comicId)));

      deleteTags(comicId, [...oldTags].filter(x => !newTags.has(x)));
      insertTags(comicId, [...newTags].filter(x => !oldTags.has(x)));

      updateComicCover.run({
        comicId,
        ...sizeOf(Buffer.from(cover.data)),
        ...cover
      });
    }),
    updateComicAccessed: (comicId, accessed) => {
      updateComicAccessed.run({ comicId, accessed: toUTC(accessed) });
    },
    updateComicBrightness: (comicId, brightness) => {
      updateComicBrightness.run({ comicId, brightness });
    },
    updateComicLayout: (comicId, layout) => {
      updateComicLayout.run({ comicId, ...layout });
    },
    updateComicUpdated: (comicId, updated) => {
      updateComicUpdated.run({ comicId, updated: toUTC(updated) });
    },
    updateComicUpdates: (comicId, { enabled, ...updates }) => {
      updateComicUpdates.run({
        comicId,
        enabled: Number(enabled),
        ...updates
      });
    },
    updateImage: (pageId, imageSrc, { data, type }) => {
      updateImage.run({
        pageId,
        src: imageSrc,
        type,
        sha256: computeChecksum('sha256', data),
        ...sizeOf(Buffer.from(data)),
        data
      });
    },
    updatePageAccessed: (pageId, accessed) => {
      updatePageAccessed.run({ pageId, accessed: toUTC(accessed) });
    },
    updatePageModified: pageId => updatePageModified.run(pageId),
    updatePageUrl: (pageId, url) => updatePageUrl.run({ pageId, url }),
    updatePageNumber: db.transaction((pageId, number) => {
      const { comicId, number: oldNumber } = formatPage(selectPage.get(pageId));

      // Shift page numbers accordingly
      if (number < oldNumber) {
        updatePageNumbersLower.run({ comicId, oldNumber, number });
      } else if (number > oldNumber) {
        updatePageNumbersHigher.run({ comicId, oldNumber, number });
      }

      updatePageNumber.run({ pageId, number });
    })
  };
}

module.exports = { createPreparedStatements };
