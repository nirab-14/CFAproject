import React from 'react';
import './ProductCard.css';

function ProductCard({ product, darkMode }) {
  return (
    <div className={`product-card ${darkMode ? 'dark' : ''}`}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {product.discount && (
          <span className="discount-badge">{product.discount}% OFF</span>
        )}
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-rating">
          <span className="stars">{'⭐'.repeat(product.rating)}</span>
          <span className="rating-text">({product.reviews} reviews)</span>
        </div>
        <div className="product-footer">
          <div className="product-price">
            <span className="current-price">${product.price}</span>
            {product.originalPrice && (
              <span className="original-price">${product.originalPrice}</span>
            )}
          </div>
          <button className="add-to-cart-btn">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;