import {Banner} from "../models/Banner";
import {request} from "../utils/request";
import {ENDPOINTS} from "../constants/endpoint";

interface BannerResponse {
    error_message: any;
    code: number;
    data: {
        banners: Banner[];
    };
}

export async function getBanners(): Promise<Banner[]> {

    console.log('[BannerService] Fetching banners...');
    try {
        const response = await request<BannerResponse>(ENDPOINTS.HOME.BANNERS);

        if (response.code === 1) {
            const banners = response.data.banners.map((banner: Banner) => new Banner(
                banner.id,
                banner.imageUrl,
                banner.url,
                banner.isActive,
                banner.orderIndex,
                banner.createdAt,
                banner.updatedAt
            ));
            console.log(`[BannerService] Successfully fetched ${banners.length} banners`);
            return banners;
        }
        console.warn('[BannerService] Received unexpected response code:', response.code);
        return [];
    } catch (error) {
        console.error('[BannerService] Error fetching banners:', error);
        return [];
    }
}