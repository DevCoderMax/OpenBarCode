from minio import Minio
from minio.error import S3Error
from dotenv import load_dotenv
import os
load_dotenv()


class MinioClient:
    def __init__(self):
        minio_host = os.getenv("MINIO_HOST")
        if minio_host:
            minio_host = minio_host.replace("http://", "").replace("https://", "")
            minio_host = minio_host.split('/')[0]

        self.client = Minio(
            minio_host,
            access_key=os.getenv("MINIO_ACCESS_KEY"),
            secret_key=os.getenv("MINIO_SECRET_KEY"),
            secure=True
        )

    def __str__(self):
        # Get the server URL from environment variable
        host = os.getenv("MINIO_HOST", "not_set")
        # Just show the host and whether it's a Minio client instance
        return f"MinioClient(host={host}, client_initialized={self.client is not None})"

    def create_bucket(self, bucket_name: str):
        if not self.client.bucket_exists(bucket_name):
            self.client.make_bucket(bucket_name)
            print(f"Bucket '{bucket_name}' criado!")
        else:
            print(f"Bucket '{bucket_name}' já existe!")

    def upload_file(self, bucket_name: str, file_path: str, object_name: str = None):
        if object_name is None:
            object_name = os.path.basename(file_path)
        result = self.client.fput_object(bucket_name, object_name, file_path)
        print(f"Arquivo '{file_path}' enviado como '{object_name}' com sucesso!")
        return {
            "object_name": result.object_name,
            "etag": result.etag,
            "version_id": getattr(result, 'version_id', None)
        }

    def download_file(self, bucket_name: str, object_name: str, file_path: str):
        self.client.fget_object(bucket_name, object_name, file_path)
        print(f"Arquivo '{object_name}' baixado com sucesso!")
        return {
            "object_name": object_name,
            "file_path": file_path
        }

    def download_file_by_etag(self, bucket_name: str, etag: str, file_path: str):
        for obj in self.client.list_objects(bucket_name):
            if obj.etag == etag:
                self.client.fget_object(bucket_name, obj.object_name, file_path)
                print(f"Arquivo '{obj.object_name}' (etag: {etag}) baixado como '{file_path}' com sucesso!")
                return {
                    "object_name": obj.object_name,
                    "file_path": file_path
                }
        raise FileNotFoundError(f"Arquivo com etag '{etag}' não encontrado no bucket '{bucket_name}'.")

    def list_buckets(self):
        return self.client.list_buckets()

    def list_objects(self, bucket_name: str):
        return self.client.list_objects(bucket_name)

    def get_object(self, bucket_name: str, etag: str):
        for obj in self.client.list_objects(bucket_name):
            if obj.etag == etag:
                response = self.client.get_object(bucket_name, obj.object_name)
                return {
                    "object_name": obj.object_name,
                    "etag": obj.etag,
                    "size": obj.size,
                    "last_modified": obj.last_modified
                }
        raise FileNotFoundError(f"Arquivo com etag '{etag}' não encontrado no bucket '{bucket_name}'.")

    def delete_object(self, bucket_name: str, etag: str):
        for obj in self.client.list_objects(bucket_name):
            if obj.etag == etag:
                self.client.remove_object(bucket_name, obj.object_name)
                print(f"Arquivo '{obj.object_name}' deletado com sucesso!")
                return
        raise FileNotFoundError(f"Arquivo com etag '{etag}' não encontrado no bucket '{bucket_name}'.")