declare type Options = {
	cleanDefs?: boolean | string[];
	cleanSymbols?: boolean | string[];
	inline?: boolean;
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

declare function svgstore(options?: Options): {
	element: import('cheerio').CheerioAPI;
	add: (id: string, file: string, options?: Options) => any;
	toString: (options?: Options) => string;
};

export default svgstore;
