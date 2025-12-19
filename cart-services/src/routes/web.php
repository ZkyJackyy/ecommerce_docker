<?php

/** @var \Laravel\Lumen\Routing\Router $router */

$router->get('/cart', function () use ($router) {
    return ' Cart Service is running ';
});

// Dummy cart data (diperbaiki agar lebih mudah dimanipulasi di POST)
// Kita menggunakan array biasa, bukan array asosiatif di level terluar items
$cartItems = [
    [
        'id' => 1,
        'product_id' => 101, // Menambahkan product_id untuk identifikasi unik item produk
        'name' => 'Product A',
        'quantity' => 2,
        'price' => 50.00
    ],
    [
        'id' => 2,
        'product_id' => 102,
        'name' => 'Product B',
        'quantity' => 1,
        'price' => 30.00
    ]
];

// Helper function untuk menghitung total
function calculateTotal($items)
{
    $total = 0.00;
    foreach ($items as $item) {
        $total += $item['price'] * $item['quantity'];
    }
    return $total;
}

// ----------------------------------------------------
// 1. GET ALL CARTS
// ----------------------------------------------------
$router->get('/carts', function () use (&$cartItems) {
    // Menggunakan & untuk mereferensikan variabel di luar agar bisa diubah.
    $response = [
        'items' => $cartItems,
        'total' => calculateTotal($cartItems)
    ];
    return response()->json($response);
});

// ----------------------------------------------------
// 2. GET CART BY ITEM ID
// ----------------------------------------------------
$router->get('/carts/{id}', function ($id) use (&$cartItems) {
    $cartId = (int) $id;
    foreach ($cartItems as $item) {
        if ($item['id'] === $cartId) {
            return response()->json($item);
        }
    }
    return response()->json(['message' => 'Item not found'], 404);
});

// ----------------------------------------------------
// 3. POST ADD TO CART (ENDPOINT BARU)
// ----------------------------------------------------
$router->post('/carts', function () use (&$cartItems) {
    // Ambil request body
    $request = app('request');
    $data = $request->json()->all();

    // Validasi data minimal
    if (!isset($data['product_id']) || !isset($data['name']) || !isset($data['price'])) {
        return response()->json(['message' => 'Data produk tidak lengkap.'], 400);
    }

    $productId = (int) $data['product_id'];
    $name = $data['name'];
    $price = (float) $data['price'];
    $quantity = (isset($data['quantity']) && $data['quantity'] > 0) ? (int) $data['quantity'] : 1;

    // Cek apakah item sudah ada di keranjang berdasarkan product_id
    $found = false;
    foreach ($cartItems as &$item) { // Gunakan & untuk modifikasi array di tempat
        if ($item['product_id'] === $productId) {
            $item['quantity'] += $quantity; // Tambah kuantitas
            $found = true;
            break;
        }
    }

    // Jika item belum ada, tambahkan item baru
    if (!$found) {
        // Buat ID baru (simulasi auto-increment)
        $newId = empty($cartItems) ? 1 : max(array_column($cartItems, 'id')) + 1;

        $newItem = [
            'id' => $newId,
            'product_id' => $productId,
            'name' => $name,
            'quantity' => $quantity,
            'price' => $price,
        ];
        $cartItems[] = $newItem;
        $item = $newItem; // Untuk response
    }

    // Beri respons item yang ditambahkan/diperbarui
    return response()->json([
        'message' => 'Item berhasil ditambahkan ke keranjang',
        'item' => $item ?? $newItem // Menggunakan $item jika sudah ada, $newItem jika baru
    ], 201);
});

// ----------------------------------------------------
// 4. DELETE ITEM FROM CARTS (Perbaikan Logika)
// ----------------------------------------------------
$router->delete('/carts/{id}', function ($id) use (&$cartItems) {
    $cartId = (int) $id;
    $initialCount = count($cartItems);

    // Filter array untuk menghapus item dengan ID yang cocok
    $cartItems = array_values(array_filter($cartItems, function ($item) use ($cartId) {
        return $item['id'] !== $cartId;
    }));

    // Cek apakah ada yang dihapus
    if (count($cartItems) === $initialCount) {
        return response()->json(['message' => 'Item not found'], 404);
    }

    // Asumsi berhasil jika count berubah
    return response()->json(['message' => 'Item deleted successfully']);
});
