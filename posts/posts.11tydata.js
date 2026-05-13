function isVoicemail(inputPath) {
  return inputPath?.endsWith("-voicemail.md") ?? false;
}

export default {
  eleventyComputed: {
    permalink: (data) => {
      if (isVoicemail(data.page.inputPath)) {
        return `/voicemails/${data.page.fileSlug}/`;
      }
      return data.permalink;
    },
    tags: (data) => {
      if (isVoicemail(data.page.inputPath)) return ["voicemails"];
      return data.tags;
    },
  },
};
