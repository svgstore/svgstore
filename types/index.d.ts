declare type SvgstoreOptions = SvgstoreAddOptions & SvgstoreTostringOptions;

declare type SvgstoreAddOptions = {
	cleanDefs?: boolean | string[];
	cleanSymbols?: boolean | string[];
	svgAttrs?:
		| boolean
		| {
				[key: string]: string;
		  };
	symbolAttrs?:
		| boolean
		| {
				[key: string]: string;
		  };
	copyAttrs?: boolean | string[];
	renameDefs?: boolean;
};

declare type SvgstoreTostringOptions = {
	inline?: boolean;
};

declare function svgstore(options?: SvgstoreOptions): {
	element: import('cheerio').CheerioAPI;
	add: (id: string, file: string, options?: SvgstoreAddOptions) => any;
	toString: (options?: SvgstoreTostringOptions) => string;
};

export { SvgstoreOptions, SvgstoreAddOptions, SvgstoreTostringOptions };
export default svgstore;
