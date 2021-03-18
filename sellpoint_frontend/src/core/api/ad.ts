import { Ad, AdImage, FavoriteAd } from "../../models/ad";
import User from "../../models/user";
import client from "../client";

class AdAPI {
  async getAllAds(): Promise<Ad[]> {
    const response = await client.get(`ad/list/`);
    return response.data;
  }

  async getById(id: number): Promise<Ad> {
    const response = await client.get(`ad/${id}/`);
    return response.data;
  }

  async createAd(ad: Ad): Promise<Ad> {
    const response = await client.post("ad/create/", {
      title: ad.title,
      price: ad.price,
      description: ad.description,
    });
    return response.data;
  }

  async addImage(id: number, image: File, description?: string): Promise<AdImage> {
    const formData = new FormData();
    formData.append("image", image);

    if (description) {
      formData.append("description", description);
    }

    const response = await client.post(`ad/create/image/${id}/`, formData);
    return response.data;
  }

  async getAllFavorites(): Promise<FavoriteAd[]> {
    const response = await client.get(`list/favorite`);
    return response.data;
  }

  async getAllFavoritesByUserId(id: number): Promise<Ad> {
    const response = await client.get(`ad/favorite/user/${id}/`);
    return response.data;
  }

  async createFavorite(user: User, ad: Ad): Promise<FavoriteAd> {
    const response = await client.post("favorite/create/", {
      user: user,
      ad: ad,
    });
    return response.data;
  }
}

export default new AdAPI();
