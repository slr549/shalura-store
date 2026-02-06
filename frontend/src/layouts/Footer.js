export class Footer {
  render() {
    return `
      <footer class="bg-secondary-800 text-white mt-20">
        <div class="container mx-auto px-4 py-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Brand -->
            <div>
              <div class="flex items-center space-x-2 mb-4">
                <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <i class="fas fa-tshirt text-primary-600 text-xl"></i>
                </div>
                <h2 class="text-xl font-bold">ShaluraStore</h2>
              </div>
              <p class="text-gray-300">
                Toko online berbagai keperluan dengan kualitas premium dan harga terjangkau.
              </p>
            </div>

            <!-- Quick Links -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Tautan Cepat</h3>
              <ul class="space-y-2">
                <li><a href="#/" class="text-gray-300 hover:text-white transition">Home</a></li>
                <li><a href="#/products" class="text-gray-300 hover:text-white transition">Semua Produk</a></li>
                <li><a href="#/categories" class="text-gray-300 hover:text-white transition">Kategori</a></li>
                <li><a href="#/about" class="text-gray-300 hover:text-white transition">Tentang Kami</a></li>
              </ul>
            </div>

            <!-- Categories -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Kategori</h3>
              <ul class="space-y-2">
                <li><a href="#/category/pria" class="text-gray-300 hover:text-white transition">Pria</a></li>
                <li><a href="#/category/wanita" class="text-gray-300 hover:text-white transition">Wanita</a></li>
                <li><a href="#/category/tas" class="text-gray-300 hover:text-white transition">Tas</a></li>
                <li><a href="#/category/sepatu" class="text-gray-300 hover:text-white transition">Sepatu</a></li>
              </ul>
            </div>

            <!-- Contact -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Kontak</h3>
              <ul class="space-y-2">
                <li class="flex items-center space-x-2">
                  <i class="fas fa-map-marker-alt text-gray-300"></i>
                  <span class="text-gray-300">Jakarta, Indonesia</span>
                </li>
                <li class="flex items-center space-x-2">
                  <i class="fas fa-phone text-gray-300"></i>
                  <span class="text-gray-300">+62 812 3456 7890</span>
                </li>
                <li class="flex items-center space-x-2">
                  <i class="fas fa-envelope text-gray-300"></i>
                  <span class="text-gray-300">hello@Shalurastore.id</span>
                </li>
              </ul>
              <div class="flex space-x-4 mt-4">
                <a href="#" class="text-gray-300 hover:text-white text-xl">
                  <i class="fab fa-instagram"></i>
                </a>
                <a href="#" class="text-gray-300 hover:text-white text-xl">
                  <i class="fab fa-facebook"></i>
                </a>
                <a href="#" class="text-gray-300 hover:text-white text-xl">
                  <i class="fab fa-twitter"></i>
                </a>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; ${new Date().getFullYear()} ShaluraStore. Toko Online</p>
          </div>
        </div>
      </footer>
    `
  }
}