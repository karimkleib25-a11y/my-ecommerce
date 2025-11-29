import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "./Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { X, Plus, Image as ImageIcon } from "lucide-react";

export function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    quantity: "",
    discount: "",
  });

  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageField = (index: number) => {
    if (imageUrls.length > 1) {
      const newImageUrls = imageUrls.filter((_, i) => i !== index);
      setImageUrls(newImageUrls);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Filter out empty image URLs
    const validImages = imageUrls.filter(url => url.trim() !== "");

    if (validImages.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    const newProduct = {
      id: `product_${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      quantity: parseInt(formData.quantity) || 0,
      discount: parseFloat(formData.discount) || 0,
      image: validImages[0], // First image as main image
      images: validImages, // All images for carousel
      storeId: user?.storeId,
      storeName: user?.storeName,
      rating: 0, // Initialize
      reviewCount: 0, // Initialize
      inStock: true,
    };

    const existingProducts = JSON.parse(
      localStorage.getItem("seller_products") || "[]"
    );
    existingProducts.push(newProduct);
    localStorage.setItem("seller_products", JSON.stringify(existingProducts));

    window.dispatchEvent(new Event("products-updated"));

    toast.success("Product added successfully!");
    navigate("/seller/products");
  };

  return (
    <Layout>
      <div className="container px-4 md:px-6 py-8 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>
              Fill in the details to add a new product to your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price ($) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Fashion">Fashion</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.discount}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>
                    Product Images <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addImageField}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Image
                  </Button>
                </div>

                <div className="space-y-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 relative">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={`Image URL ${index + 1}`}
                          value={url}
                          onChange={(e) => handleImageChange(index, e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      {imageUrls.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeImageField(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Add multiple image URLs to create a carousel. First image will be the main product image.
                </p>

                {/* Image Preview */}
                {imageUrls.some(url => url.trim()) && (
                  <div className="border rounded-lg p-4">
                    <Label className="text-sm mb-2 block">Preview:</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {imageUrls
                        .filter(url => url.trim())
                        .map((url, index) => (
                          <div key={index} className="relative aspect-square rounded overflow-hidden border">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/200?text=Invalid+URL";
                              }}
                            />
                            {index === 0 && (
                              <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                                Main
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Add Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/seller/products")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}