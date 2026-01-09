<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use Illuminate\Http\Request;

// File untuk menyimpan data keranjang (sebagai pengganti database)
// Disimpan di folder storage agar bisa ditulis
define('CART_FILE', storage_path('app/cart_data.json'));

// Helper: Baca Data
function getCart()
{
    if (!file_exists(CART_FILE)) {
        return [];
    }
    $json = file_get_contents(CART_FILE);
    return json_decode($json, true) ?? [];
}

// Helper: Simpan Data
function saveCart($data)
{
    // Pastikan folder storage ada
    if (!is_dir(dirname(CART_FILE))) mkdir(dirname(CART_FILE), 0777, true);
    file_put_contents(CART_FILE, json_encode($data, JSON_PRETTY_PRINT));
}

$router->get('/cart', function () {
    return 'Cart Service is running (File Based)';
});

// ----------------------------------------------------
// 1. GET ALL CARTS
// ----------------------------------------------------
$router->get('/carts', function () {
    $cartItems = getCart();

    // Hitung total
    $total = 0;
    foreach ($cartItems as $item) {
        $total += $item['price'] * $item['quantity'];
    }

    return response()->json([
        'items' => array_values($cartItems),
        'total' => $total
    ]);
});

// ----------------------------------------------------
// 2. ADD TO CART
// ----------------------------------------------------
$router->post('/carts', function (Request $request) {
    $cartItems = getCart();

    $id = (int) $request->input('product_id');
    $name = $request->input('name');
    $price = (float) $request->input('price');
    $qty = (int) $request->input('quantity', 1);

    if (!$id || !$name || !$price) {
        return response()->json(['message' => 'Data tidak lengkap'], 400);
    }

    // Cek apakah produk sudah ada?
    $found = false;
    foreach ($cartItems as $key => $item) {
        if ($item['product_id'] === $id) {
            $cartItems[$key]['quantity'] += $qty;
            $found = true;
            break;
        }
    }

    // Jika baru, tambah ke array
    if (!$found) {
        $cartItems[] = [
            'id' => count($cartItems) + 1, // ID unik keranjang
            'product_id' => $id,
            'name' => $name,
            'price' => $price,
            'quantity' => $qty
        ];
    }

    // SIMPAN KE FILE (PENTING!)
    saveCart($cartItems);

    return response()->json(['message' => 'Berhasil masuk keranjang']);
});

// ----------------------------------------------------
// 3. DELETE ITEM
// ----------------------------------------------------
$router->delete('/carts/{productId}', function ($productId) {
    $cartItems = getCart();
    $initialCount = count($cartItems);
    $pId = (int) $productId;

    // Hapus item berdasarkan product_id
    $newCart = array_filter($cartItems, function ($item) use ($pId) {
        return $item['product_id'] !== $pId;
    });

    if (count($newCart) === $initialCount) {
        return response()->json(['message' => 'Item tidak ditemukan'], 404);
    }

    // Simpan perubahan
    saveCart(array_values($newCart));

    return response()->json(['message' => 'Item dihapus']);
});
