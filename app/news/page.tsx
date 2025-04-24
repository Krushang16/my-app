"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Volume2, VolumeX, Search, Languages } from "lucide-react";

// Define the available languages
const languages = [
  { id: "en", name: "English" },
  { id: "hi", name: "Hindi" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "it", name: "Italian" },
  { id: "pt", name: "Portuguese" },
  { id: "ru", name: "Russian" },
  { id: "zh", name: "Chinese" },
  { id: "ja", name: "Japanese" },
  { id: "ar", name: "Arabic" },
];

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  description?: string;
  urlToImage?: string;
  publishedAt?: string;
  author?: string;
  translatedTitle?: string;
  translatedDescription?: string;
}

export default function NewsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalArticles, setTotalArticles] = useState(0);
  const [translating, setTranslating] = useState(false);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const speechUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== "undefined") {
      speechSynthesis.current = window.speechSynthesis;
    }

    return () => {
      // Clean up speech synthesis on component unmount
      if (speechSynthesis.current && speechUtterance.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the News API with top-headlines endpoint
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=environment+OR+climate+OR+waste+OR+pollution&apiKey=be4218b536f644fe926917005d3fde61
`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();

        if (data && data.articles && data.articles.length > 0) {
          setTotalArticles(data.articles.length);

          // Transform News API format to match our interface
          const transformedNews = data.articles.map((article: any) => ({
            title: article.title,
            url: article.url,
            source: article.source.name,
            description: article.description,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt,
            author: article.author,
          }));

          setNews(transformedNews);
        } else {
          setError("No news articles found");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Effect to handle translation when language changes
  useEffect(() => {
    const translateNews = async () => {
      if (selectedLanguage === "en") {
        // If English is selected, reset translations
        setNews((prevNews) =>
          prevNews.map((article) => ({
            ...article,
            translatedTitle: undefined,
            translatedDescription: undefined,
          }))
        );
        return;
      }

      setTranslating(true);

      try {
        // Translate each article
        const translatedNews = await Promise.all(
          news.map(async (article) => {
            try {
              // Use a different translation API
              const titleResponse = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${selectedLanguage}&dt=t&q=${encodeURIComponent(
                  article.title
                )}`
              );

              const titleData = await titleResponse.json();
              const translatedTitle = titleData[0]
                .map((item: any) => item[0])
                .join("");

              // Translate description if available
              let translatedDescription;
              if (article.description) {
                const descResponse = await fetch(
                  `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${selectedLanguage}&dt=t&q=${encodeURIComponent(
                    article.description
                  )}`
                );

                const descData = await descResponse.json();
                translatedDescription = descData[0]
                  .map((item: any) => item[0])
                  .join("");
              }

              return {
                ...article,
                translatedTitle,
                translatedDescription,
              };
            } catch (err) {
              console.error("Error translating article:", err);
              // Fallback to a simpler translation approach if the API fails
              return {
                ...article,
                translatedTitle: `[${getLanguageName(selectedLanguage)}] ${
                  article.title
                }`,
                translatedDescription: article.description
                  ? `[${getLanguageName(selectedLanguage)}] ${
                      article.description
                    }`
                  : undefined,
              };
            }
          })
        );

        setNews(translatedNews);
      } catch (err) {
        console.error("Error in translation process:", err);
        setError("Failed to translate news. Please try again later.");
      } finally {
        setTranslating(false);
      }
    };

    translateNews();
  }, [selectedLanguage]);

  const toggleSpeech = (index: number, article: NewsArticle) => {
    // If already speaking this article, stop
    if (speaking === index) {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
        setSpeaking(null);
      }
      return;
    }

    // Stop any current speech
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
    }

    // Create new utterance
    const textToSpeak =
      selectedLanguage === "en"
        ? article.description
          ? `${article.title}. ${article.description}`
          : article.title
        : article.translatedDescription
        ? `${article.translatedTitle}. ${article.translatedDescription}`
        : article.translatedTitle || article.title;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Set language based on selected language
    utterance.lang = selectedLanguage;

    // Set up event handlers
    utterance.onend = () => {
      setSpeaking(null);
    };

    utterance.onerror = () => {
      console.error("Speech synthesis error");
      setSpeaking(null);
    };

    // Store reference and speak
    speechUtterance.current = utterance;
    speechSynthesis.current?.speak(utterance);
    setSpeaking(index);
  };

  const getLanguageName = (langId: string) => {
    const language = languages.find((l) => l.id === langId);
    return language ? language.name : langId;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredNews = searchTerm
    ? news.filter((article) => {
        const title =
          selectedLanguage === "en"
            ? article.title
            : article.translatedTitle || article.title;
        const description =
          selectedLanguage === "en"
            ? article.description
            : article.translatedDescription || article.description;

        return (
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (description &&
            description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      })
    : news;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Latest News</h1>
        <div className="w-[180px]">
          <Select
            value={selectedLanguage}
            onValueChange={(value) => {
              setSelectedLanguage(value);
              // Stop any current speech when language changes
              if (speechSynthesis.current) {
                speechSynthesis.current.cancel();
                setSpeaking(null);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.id} value={language.id}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        {totalArticles > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredNews.length} of {totalArticles} articles
          </p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      )}

      {translating && (
        <div className="flex justify-center items-center h-32">
          <div className="flex flex-col items-center">
            <Languages className="h-8 w-8 text-green-500 animate-pulse mb-2" />
            <p className="text-gray-600">
              Translating news to {getLanguageName(selectedLanguage)}...
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNews.map((article, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {article.urlToImage && (
              <div className="relative h-48 w-full">
                <Image
                  src={article.urlToImage}
                  alt={
                    selectedLanguage === "en"
                      ? article.title
                      : article.translatedTitle || article.title
                  }
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between mb-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {article.source}
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {getLanguageName(selectedLanguage)}
                </span>
              </div>
              <h2 className="text-xl font-semibold mb-2 line-clamp-3">
                {selectedLanguage === "en"
                  ? article.title
                  : article.translatedTitle || article.title}
              </h2>
              {(selectedLanguage === "en"
                ? article.description
                : article.translatedDescription || article.description) && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {selectedLanguage === "en"
                    ? article.description
                    : article.translatedDescription || article.description}
                </p>
              )}
              {article.publishedAt && (
                <p className="text-sm text-gray-500 mb-2">
                  {formatDate(article.publishedAt)}
                </p>
              )}
              <div className="flex justify-between items-center mt-4">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Read Full Article
                </a>
                <button
                  onClick={() => toggleSpeech(index, article)}
                  className={`p-2 rounded-full ${
                    speaking === index
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label={
                    speaking === index ? "Stop reading" : "Read article"
                  }
                >
                  {speaking === index ? (
                    <VolumeX size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && !loading && !error && !translating && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No news articles found.</p>
          {searchTerm && (
            <p className="text-gray-400 text-sm mt-2">
              Try a different search term.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
