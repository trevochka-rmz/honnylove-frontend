import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useBlogs, useBlogTags } from "@/hooks/useBlogs";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Clock, ImageOff } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 6;

const BlogCardSkeleton = () => (
  <div className="bg-card rounded-2xl overflow-hidden border border-border">
    <Skeleton className="aspect-[16/10] w-full" />
    <div className="p-5">
      <Skeleton className="h-5 w-20 mb-3" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const debouncedSearch = useDebounce(searchInput, 300);
  
  // Fetch tags from API
  const { data: tags = [] } = useBlogTags();
  
  const apiParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
  };
  
  const { data: result, isLoading } = useBlogs(apiParams);
  
  const posts = result?.posts || [];
  const totalPages = result?.pages || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
  };

  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('ellipsis-start');
      }
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Check if an image URL is valid
  const isValidImage = (url?: string) => {
    return url && url.trim() !== '' && !url.includes('undefined');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
            Блог о красоте
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Советы по уходу за кожей, обзоры продуктов и секреты корейской косметики
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          {/* Search - full width */}
          <div className="relative w-full max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск статей..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 py-6 text-base font-roboto rounded-full border-2 focus:border-primary"
            />
          </div>
          
          {/* Tags - centered */}
          {tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors px-4 py-1.5 text-sm"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-destructive/10 text-destructive border-destructive/30 px-4 py-1.5 text-sm"
                  onClick={() => {
                    setSelectedTags([]);
                    setCurrentPage(1);
                  }}
                >
                  Сбросить теги
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">📝</span>
              <h3 className="text-xl font-semibold mb-2">Статьи не найдены</h3>
              <p className="text-muted-foreground mb-4">
                Попробуйте изменить параметры поиска
              </p>
              <button
                onClick={() => {
                  setSearchInput("");
                  setSelectedTags([]);
                  setCurrentPage(1);
                }}
                className="text-primary hover:underline"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug || post.id}`}
                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-secondary/30">
                      {isValidImage(post.image) ? (
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/50 to-rose-light/30';
                            placeholder.innerHTML = `
                              <div class="p-3 rounded-full bg-secondary/50 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary/50"><line x1="2" x2="22" y1="2" y2="22"></line><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"></path><line x1="13.5" x2="6" y1="13.5" y2="21"></line><path d="m18 12 2 2 2-2"></path><path d="M21 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path></svg>
                              </div>
                              <span class="text-xs text-muted-foreground">Скоро появится</span>
                            `;
                            (e.target as HTMLImageElement).parentElement?.appendChild(placeholder);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-secondary/50 to-rose-light/30">
                          <div className="p-3 rounded-full bg-secondary/50 mb-2">
                            <ImageOff className="h-6 w-6 text-primary/50" />
                          </div>
                          <span className="text-xs text-muted-foreground">Скоро появится</span>
                        </div>
                      )}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {getPaginationNumbers().map((page, idx) => (
                        <PaginationItem key={idx}>
                          {typeof page === "string" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
