from flask import Flask, request, jsonify

app = Flask(__name__)

# data dummy
# Perhatian: Pastikan nama field konsisten, gunakan 'product_id'
reviews = [
    { 'id': 1, 'product_id': 101, 'review': 'Handphone murah yang bagus.', 'rating': 4.5}, 
    { 'id': 2, 'product_id': 101, 'review': 'Baterai awet.', 'rating': 4.0},
    { 'id': 3, 'product_id': 102, 'review': 'Laptop cepat, recommended.', 'rating': 5.0}     
]

# ----------------------------------------------------------------------
# GET ALL REVIEWS (Endpoint utama, tidak perlu endpoint 'welcome')
# Gunakan satu fungsi untuk satu route path yang sama.
# Path: /reviews (GET)
# ----------------------------------------------------------------------
@app.route('/reviews', methods=['GET'])
def get_all_reviews():
    # Menghapus duplikasi endpoint get_reviews dan home.
    return jsonify(reviews)

# ----------------------------------------------------------------------
# GET REVIEW BY REVIEW ID (Perbaikan typo dan logika)
# Path: /reviews/{review_id} (GET)
# ----------------------------------------------------------------------
# Perhatian: Anda salah mendefinisikan URL path dan variabel fungsi.
# URL harus mencerminkan variabel yang akan diambil.
@app.route('/reviews/<int:review_id>', methods=['GET'])
def get_reviews_by_review_id(review_id):
    # 'review_id' harus cocok dengan nama variabel di URL.
    # Digunakan next() untuk mencari item pertama, jika tidak ada, defaultnya None.
    review = next((r for r in reviews if r['id'] == review_id), None)
    
    if review is None:
        # Mengembalikan status 404 jika tidak ditemukan
        return jsonify({'message': 'Review not found'}), 404
    
    return jsonify(review)

# ----------------------------------------------------------------------
# GET REVIEWS BY PRODUCT ID (Berjalan dengan benar)
# Path: /reviews/product/{product_id} (GET)
# ----------------------------------------------------------------------
@app.route('/reviews/product/<int:product_id>', methods=['GET'])
def get_reviews_by_product_id(product_id):
    # Mengambil semua review yang cocok dengan product_id
    filtered_reviews = [r for r in reviews if r['product_id'] == product_id]
    return jsonify(filtered_reviews)

# ----------------------------------------------------------------------
# CREATE REVIEW
# Path: /reviews (POST)
# ----------------------------------------------------------------------
@app.route('/reviews', methods=['POST'])
def create_review():
    # KESALAHAN UTAMA: request.get.json() tidak ada. 
    # Yang benar adalah request.get_json()
    data = request.get_json() 

    # Cek jika data JSON kosong (misal: header Content-Type salah atau body kosong)
    if not data:
        return jsonify({'message': 'Invalid JSON data'}), 400

    # Perbaikan: Ubah 'produk_id' menjadi 'product_id' agar konsisten dengan data dummy
    # dan format umumnya.
    required_fields = ['product_id', 'review', 'rating'] 
    
    # Cek kelengkapan fields
    missing = [f for f in required_fields if f not in data]

    if missing:
        return jsonify({'message': f'Missing fields: {", ".join(missing)}'}), 400

    # Simulasi Auto-Increment ID
    new_id = reviews[-1]['id'] + 1 if reviews else 1 

    review = {
        'id': new_id,
        'product_id': data['product_id'], # Menggunakan product_id
        'review': data['review'],
        'rating': data['rating']
    }

    reviews.append(review)
    return jsonify(review), 201

if __name__ == '__main__':
    # Pastikan host dan port sesuai dengan Dockerfile
    app.run(debug=True, host='0.0.0.0', port=5002)