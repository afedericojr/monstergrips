document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Ready");

    // ===== Modal Setup =====
    const modal = document.getElementById("customModal");
    const modalBody = modal?.querySelector(".modal-body");

    if (modal && modalBody) {
        function openModalWithContent(html) {
            console.log("Opening modal");
            modalBody.innerHTML = html;
            modal.classList.add("show");
            document.body.classList.add("modal-open");
        }

        function closeModal() {
            console.log("Closing modal");
            modal.classList.remove("show");
            modalBody.innerHTML = "";
            document.body.classList.remove("modal-open");
        }

        document.querySelectorAll(".openModal").forEach(button => {
            button.addEventListener("click", e => {
                e.preventDefault();
                console.log("Modal button clicked");

                const container = button.closest("article, footer");
                const content = container?.querySelector(".modalContent");

                if (content) {
                    let html = content.innerHTML;

                    html = html.replace(
                        /\[youtube:([^\]]+)\]/g,
                        (_, id) =>
                            `<iframe width="560" height="315" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
                    );

                    openModalWithContent(html);
                } else {
                    console.warn("No .modalContent found for this button");
                }
            });
        });

        modal.querySelector(".close")?.addEventListener("click", closeModal);

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && modal.classList.contains("show")) {
                closeModal();
            }
        });

        modal.addEventListener("click", e => {
            if (e.target === modal) {
                closeModal();
            }
        });
    } else {
        console.warn("Skipping modal setup; no modal or modalBody found");
    }

    // ===== Post Sorting =====
    function enablePostSorting() {
        const postSection = document.querySelector(".posts");
        const sortDropdown = document.getElementById("sortPosts");
    
        if (!postSection || !sortDropdown) return;
    
        function sortArticles(direction) {
            const articles = Array.from(postSection.querySelectorAll("article"));
    
            articles.sort((a, b) => {
                const dateA = new Date(a.getAttribute("data-date"));
                const dateB = new Date(b.getAttribute("data-date"));
                return direction === "newest" ? dateB - dateA : dateA - dateB;
            });
    
            articles.forEach(article => postSection.appendChild(article));
        }
    
        sortDropdown.addEventListener("change", () => {
            sortArticles(sortDropdown.value);
        });
    
        sortArticles(sortDropdown.value || "newest");
    }

    enablePostSorting();

    // ===== Reviews Infinite Loader =====
    console.log('Reviews section loading...');
    let reviews = [];
    let reviewIndex = 0;
    const batchSize = 10;

    const reviewList = document.getElementById("review-list");
    const loadMoreBtn = document.getElementById("load-more-reviews");

    if (reviewList && loadMoreBtn) {
        function createStarRating(rating) {
            let stars = "";
            for (let i = 1; i <= 5; i++) {
                stars += i <= rating ? "★" : "☆";
            }
            return `<span class="stars">${stars}</span>`;
        }

        function loadReviews() {
            const nextBatch = reviews.slice(reviewIndex, reviewIndex + batchSize);
            nextBatch.forEach(review => {
                const formattedDate = new Date(review.Date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
        
                const card = document.createElement("div");
                card.classList.add("review-card");
                card.innerHTML = `
                    <div class="review-header">
                        <div class="review-name">${review.Name}</div>
                        <div class="review-date">${formattedDate}</div>
                    </div>
                    <div class="review-title">${review.Title}</div>
                    <div class="review-rating">${createStarRating(review.Rating)}</div>
                    <div class="review-text">${review.Review}</div>
                `;
                reviewList.appendChild(card);
            });
            reviewIndex += batchSize;
            if (reviewIndex >= reviews.length) {
                loadMoreBtn.style.display = "none";
            }
        }
        

        function sortReviews(direction) {
            reviews.sort((a, b) => {
                const dateA = new Date(a.Date);
                const dateB = new Date(b.Date);
                return direction === "newest" ? dateB - dateA : dateA - dateB;
            });
            reviewList.innerHTML = "";  // Clear displayed reviews
            reviewIndex = 0;            // Reset index
        }
        
        function enableReviewSorting() {
            const sortDropdownReviews = document.getElementById("sortReviews");
        
            if (sortDropdownReviews) {
                sortDropdownReviews.addEventListener("change", () => {
                    sortReviews(sortDropdownReviews.value);
                    reviewIndex = 0;
                    reviewList.innerHTML = "";
                    loadReviews();
                });
            }
        }
        
        function fetchReviews() {
            fetch("data/reviewData.json")
                .then(res => res.json())
                .then(data => {
                    reviews = data;
                    sortReviews("newest");  // Sort BEFORE loading
                    loadReviews();          // Load initial batch after sorting
                    enableReviewSorting();
                })
                .catch(err => {
                    console.error("Error loading reviews:", err);
                    loadMoreBtn.style.display = "none";
                });
        }
        fetchReviews();


        loadMoreBtn.addEventListener("click", loadReviews);
        // Auto-load on scroll
        let isLoading = false;

        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= window.innerHeight &&
                rect.bottom >= 0
            );
        }
        
        window.addEventListener("scroll", () => {
            if (isLoading || reviewIndex >= reviews.length) return;
        
            if (isElementInViewport(loadMoreBtn)) {
                isLoading = true;
                setTimeout(() => {
                    loadReviews();
                    isLoading = false;
                }, 200);
            }
        });
            
             
    } else {
        console.warn("Review section elements not found; skipping review loader");
    }
});
