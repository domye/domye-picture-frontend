<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传图片</div>
      </div>
    </a-upload>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import type { UploadProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { uploadPicture } from '@/api/pictureController.ts'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}
//数据
const loading = ref<boolean>(false)
const props = defineProps<Props>()

// Supported image types with their MIME types and magic numbers
const SUPPORTED_IMAGE_TYPES: Record<string, { mime: string; signatures: number[][] }> = {
  jpeg: { mime: 'image/jpeg', signatures: [[0xff, 0xd8, 0xff]] },
  png: { mime: 'image/png', signatures: [[0x89, 0x50, 0x4e, 0x47]] },
  gif: { mime: 'image/gif', signatures: [[0x47, 0x49, 0x46, 0x38]] },
  webp: { mime: 'image/webp', signatures: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const MAX_DIMENSION = 4096 // Max width/height

/**
 * Validate file by checking magic numbers (file signature)
 */
const validateFileSignature = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer)

      // Check each supported type
      for (const [, config] of Object.entries(SUPPORTED_IMAGE_TYPES)) {
        for (const signature of config.signatures) {
          const matches = signature.every((byte, index) => arr[index] === byte)
          if (matches) {
            resolve(true)
            return
          }
        }
      }
      resolve(false)
    }
    reader.onerror = () => resolve(false)
    reader.readAsArrayBuffer(file.slice(0, 8)) // Read first 8 bytes
  })
}

/**
 * Validate image dimensions
 */
const validateDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }

    img.src = url
  })
}

const beforeUpload = async (file: UploadProps['fileList'][number]) => {
  // 1. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    message.error(`文件大小超出限制，最大支持 ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    return false
  }

  // 2. Validate MIME type
  const allowedMimes = Object.values(SUPPORTED_IMAGE_TYPES).map((t) => t.mime)
  if (!allowedMimes.includes(file.type)) {
    message.error('不支持的图片格式，支持: JPEG, PNG, GIF, WebP')
    return false
  }

  // 3. Validate file signature (magic numbers)
  const isValidSignature = await validateFileSignature(file)
  if (!isValidSignature) {
    message.error('文件内容与扩展名不匹配，请确认是否为真实图片文件')
    return false
  }

  // 4. Validate dimensions
  const dimensions = await validateDimensions(file)
  if (!dimensions) {
    message.error('无法读取图片尺寸，请确认文件是否损坏')
    return false
  }

  if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
    message.error(`图片尺寸超出限制，最大支持 ${MAX_DIMENSION}x${MAX_DIMENSION} 像素`)
    return false
  }

  return true
}

/**
 * 上传图片
 * @param file
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPicture(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败')
  }
  loading.value = false
}
</script>
<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-width: 152px;
  min-height: 152px;
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
