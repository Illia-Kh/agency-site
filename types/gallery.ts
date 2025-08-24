export type MediaKind = 'image' | 'video';

export type GalleryItem = {
  id: string;
  title: string;
  kind: MediaKind;
  src: string;
  poster?: string;
  alt: string;
  href?: string;
};
