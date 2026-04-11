export interface NFTAsset {
  id: string;
  content: {
    json_uri: string;
    metadata: {
      name: string;
      symbol: string;
      description?: string;
      attributes?: Array<{ value: string; trait_type: string }>;
    };
    links?: {
      image?: string;
      external_url?: string;
    };
    files?: Array<{
      uri: string;
      cdn_uri?: string;
      mime?: string;
    }>;
  };
  grouping?: Array<{
    group_key: string;
    group_value: string;
    collection_metadata?: {
      name: string;
      image?: string;
    };
  }>;
  ownership: {
    owner: string;
  };
}

export interface NFTQueryResult {
  items: NFTAsset[];
  total: number;
  page: number;
}

export interface BlueshiftTask {
  id: number;
  collectionAddress: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  challengeUrl: string;
  videoUrls: Array<{ label: string; url: string }>;
  codeUrls: Array<{ label: string; url: string }>;
  articleUrl?: string;
  required: boolean;
}
