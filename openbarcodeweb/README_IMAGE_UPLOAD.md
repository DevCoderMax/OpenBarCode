# Upload de Imagens - OpenBarCode

Este documento descreve as funcionalidades de upload e gerenciamento de imagens implementadas no frontend do OpenBarCode.

## Funcionalidades Implementadas

### 1. Hook useImageUpload
- **Arquivo**: `hooks/useImageUpload.ts`
- **Funcionalidades**:
  - Upload de imagens para o servidor MinIO
  - Geração de URLs de download
  - Exclusão de imagens
  - Gerenciamento de estado de loading e erros

### 2. Componente ImageUpload
- **Arquivo**: `components/ui/ImageUpload.tsx`
- **Funcionalidades**:
  - Interface visual para upload de imagens
  - Preview das imagens carregadas
  - Remoção de imagens individuais
  - Validação de tipo e tamanho de arquivo
  - Limite configurável de imagens (padrão: 5)

### 3. Componente ImageCarousel
- **Arquivo**: `components/ui/ImageCarousel.tsx`
- **Funcionalidades**:
  - Exibição de múltiplas imagens em carrossel
  - Navegação entre imagens
  - Indicadores visuais
  - Contador de imagens
  - Placeholder para produtos sem imagens

### 4. Utilitários de Imagem
- **Arquivo**: `utils/imageUtils.ts`
- **Funcionalidades**:
  - Conversão entre string e array de URLs
  - Geração de URLs de download
  - Extração de ETags de URLs
  - Validação de URLs de imagem
  - Obtenção da primeira imagem

## Como Usar

### Upload de Imagens em Formulários

```tsx
import { ImageUpload } from '@/components/ui/ImageUpload';
import { parseImageUrls, stringifyImageUrls } from '@/utils/imageUtils';

// No seu componente
const imagesArray = parseImageUrls(product?.images || null);

<ImageUpload
  label="Product Images"
  images={imagesArray}
  onImagesChange={(images) => setProduct({ 
    ...product, 
    images: stringifyImageUrls(images) 
  })}
  maxImages={5}
/>
```

### Exibição de Imagens em Carrossel

```tsx
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { parseImageUrls } from '@/utils/imageUtils';

// No seu componente
const imagesArray = parseImageUrls(product?.images || null);

<ImageCarousel
  images={imagesArray}
  height={250}
  showIndicators={true}
/>
```

### Upload Programático

```tsx
import { useImageUpload } from '@/hooks/useImageUpload';

// No seu componente
const { uploadImage, getImageUrl, deleteImage, uploading, error } = useImageUpload();

const handleFileUpload = async (file: File) => {
  const uploadedImage = await uploadImage(file);
  if (uploadedImage) {
    const imageUrl = getImageUrl(uploadedImage.etag);
    // Use a imageUrl conforme necessário
  }
};
```

## Estrutura de Dados

### Modelo de Imagem
```typescript
interface UploadedImage {
  object_name: string;
  etag: string;
  size: number;
  last_modified: string;
}
```

### Armazenamento de Imagens
- As imagens são armazenadas como URLs separadas por vírgula no campo `images` do produto
- Cada URL segue o padrão: `https://api-url/api/v1/images/download/{etag}`
- O ETag é usado como identificador único da imagem

## Validações

### Tipos de Arquivo Suportados
- Apenas arquivos de imagem (MIME type: `image/*`)

### Limites
- Tamanho máximo: 5MB por imagem
- Quantidade máxima: 5 imagens por produto (configurável)

## Integração com Backend

### Rotas Utilizadas
- `POST /api/v1/images/` - Upload de imagem
- `GET /api/v1/images/download/{etag}` - Download de imagem
- `DELETE /api/v1/images/{etag}` - Exclusão de imagem

### Armazenamento
- As imagens são armazenadas no MinIO
- O bucket padrão é "openbarcode"
- Os nomes dos objetos são gerados com UUID para evitar conflitos

## Tratamento de Erros

### Upload
- Validação de tipo de arquivo
- Validação de tamanho
- Tratamento de erros de rede
- Feedback visual durante o upload

### Exclusão
- Confirmação antes da exclusão
- Tratamento de falhas na exclusão
- Fallback para remoção local em caso de erro

### Exibição
- Placeholder para imagens não encontradas
- Tratamento de URLs inválidas
- Loading states durante carregamento

## Melhorias Futuras

1. **Compressão de Imagens**: Implementar compressão automática antes do upload
2. **Crop e Redimensionamento**: Adicionar funcionalidades de edição de imagem
3. **Drag and Drop**: Implementar arrastar e soltar para upload
4. **Upload em Lote**: Permitir seleção de múltiplas imagens de uma vez
5. **Cache de Imagens**: Implementar cache local para melhor performance
6. **Lazy Loading**: Carregar imagens conforme necessário 