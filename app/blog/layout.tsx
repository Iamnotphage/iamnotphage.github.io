import { BlogSearchProvider } from "@/components/blog-search-context"
import { SiteNavbar } from "@/components/site-navbar"

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BlogSearchProvider>
      <div className="relative min-h-screen w-full">
        <SiteNavbar />
        <main className="pt-2">{children}</main>
      </div>
    </BlogSearchProvider>
  )
}
