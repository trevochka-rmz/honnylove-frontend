import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useBlogs, BlogPost } from "@/hooks/useBlogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Loader2, X } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const categories = ["Все", "Уход за кожей", "Тренды", "Домашняя одежда", "Ингредиенты", "Сезонный уход", "Лайфстайл"];

// Skeleton component for blog card
const BlogCardSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
    <div className="aspect-[16/10] bg-muted" />
    <div className="p-5">
      <div className="h-5 w-20 bg-muted rounded mb-3" />
      <div className="h-5 w-full bg-muted rounded mb-2" />
      <div className="h-4 w-3/4 bg-muted rounded mb-4" />
      <div className="flex justify-between">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
    </div>
  </div>
);

const Blog = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 6;

  const { data, isLoading, error } = useBlogs({
    page: currentPage,
    limit: POSTS_PER_PAGE,
    tags: selectedTag && selectedTag !== "Все" ? selectedTag.toLowerCase() : undefined,
  });

  const posts = data?.posts || [];
  const totalPages = data?.pages || 1;
  const featuredPost = posts[0];

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag === "Все" ? null : tag);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Блог HonnyLove
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Советы по уходу за кожей, тренды красоты, обзоры продуктов и секреты здорового сна
          </p>
        </div>

        {/* Featured Post */}
        {isLoading ? (
          <div className="mb-12">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-[4/3] md:aspect-auto bg-muted" />
                <div className="p-6 md:p-10 flex flex-col justify-center">
                  <div className="h-6 w-24 bg-muted rounded mb-4" />
                  <div className="h-8 w-full bg-muted rounded mb-4" />
                  <div className="h-4 w-3/4 bg-muted rounded mb-6" />
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : featuredPost ? (
          <Link 
            to={`/blog/${featuredPost.slug || featuredPost.id}`}
            className="block mb-12 group"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-[4/3] md:aspect-auto">
                  <img 
                    src={featuredPost.image} 
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 md:p-10 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-primary/20 text-primary hover:bg-primary/30">
                    {featuredPost.category}
                  </Badge>
                  <h2 className="font-playfair text-2xl md:text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.read_time} мин
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : null}

        {/* Categories / Tags Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleTagChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                (category === "Все" && !selectedTag) || selectedTag === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Active tag badge */}
        {selectedTag && (
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className="px-3 py-1.5 gap-2">
              Фильтр: {selectedTag}
              <button onClick={() => handleTagChange("Все")}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">💫</span>
            <h3 className="text-xl font-semibold mb-2">Загружаем статьи...</h3>
            <p className="text-muted-foreground mb-4">
              Пожалуйста, подождите немного
            </p>
            <Button onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
          </div>
        )}

        {/* Posts Grid */}
        {!isLoading && !error && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug || post.id}`}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <Badge variant="secondary" className="mb-3">
                    {post.category}
                  </Badge>
                  <h3 className="font-playfair text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString("ru-RU", { 
                        day: "numeric", 
                        month: "short" 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.read_time} мин чтения
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className="text-xl font-semibold mb-2">Статей не найдено</h3>
            <p className="text-muted-foreground mb-4">
              {selectedTag ? `В категории "${selectedTag}" пока нет статей` : 'Статьи скоро появятся'}
            </p>
            {selectedTag && (
              <Button onClick={() => handleTagChange("Все")}>
                Показать все статьи
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-10">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Newsletter */}
        <section className="mt-16 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold mb-4">
            Подпишитесь на рассылку
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Получайте новые статьи, эксклюзивные скидки и советы по уходу за собой
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Ваш email"
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Подписаться
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
