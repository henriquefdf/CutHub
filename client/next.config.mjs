/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns: [{
            // (https://geoprospect.s3.sa-east-1.amazonaws.com/a1d3e7bb36687d09f2dc)
            hostname: 'geoprospect.s3.sa-east-1.amazonaws.com',
        }]
    }
};

export default nextConfig;
