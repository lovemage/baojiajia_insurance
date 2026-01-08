import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'profile';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    schema
}) => {
    const siteUrl = 'https://baojiajia.org';
    const defaultImage = `${siteUrl}/hero.png`;

    const fullUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url}`) : siteUrl;
    const metaImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;
    const metaKeywords = keywords?.join(', ');

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {metaKeywords && <meta name="keywords" content={metaKeywords} />}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph Tags */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content="保家佳 (Bao Jiajia)" />

            {/* Article Specific OG Tags */}
            {type === 'article' && (
                <>
                    {author && <meta property="article:author" content={author} />}
                    {publishedTime && <meta property="article:published_time" content={publishedTime} />}
                    {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
                </>
            )}

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={metaImage} />

            {/* JSON-LD Schema */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};
