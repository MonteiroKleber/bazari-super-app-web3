
import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Grid, List, Eye, Send, RefreshCw, Image as ImageIcon } from 'lucide-react'
import { Input } from '@shared/ui/Input'
import { Button } from '@shared/ui/Button'
import { Badge } from '@shared/ui/Badge'
import { Modal } from '@shared/ui/Modal'
import { EmptyState } from '@shared/ui/EmptyState'
import { LoadingSpinner } from '@shared/ui/LoadingSpinner'
import { useI18n } from '@app/providers/I18nProvider'
import { useNfts, NftWithMetadata } from '../hooks/useNfts'
import { useActiveAccount } from '../hooks/useActiveAccount'

export const NftsTab: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { isWatchOnly } = useActiveAccount()
  const { 
    nfts, 
    collections, 
    isLoading, 
    searchQuery, 
    selectedCollection,
    handleSearch,
    handleCollectionFilter,
    clearFilters,
    refreshNfts,
    hasNfts,
    totalCount,
    filteredCount
  } = useNfts()
  
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  const [selectedNft, setSelectedNft] = React.useState<NftWithMetadata | null>(null)
  const [showFilters, setShowFilters] = React.useState(false)

  const handleNftClick = (nft: NftWithMetadata) => {
    setSelectedNft(nft)
  }

  const handleTransfer = (nft: NftWithMetadata) => {
    navigate(`/wallet/send?type=nft&collection=${nft.collection}&id=${nft.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!hasNfts) {
    return (
      <EmptyState
        icon={<ImageIcon size={48} />}
        title={t('wallet.no_nfts_title') || 'Nenhum NFT encontrado'}
        description={t('wallet.no_nfts_description') || 'Seus NFTs aparecerão aqui quando você possuir algum.'}
        action={
          <div className="flex space-x-3">
            <Button onClick={refreshNfts} variant="outline">
              <RefreshCw size={16} className="mr-2" />
              {t('wallet.refresh') || 'Atualizar'}
            </Button>
            <Button onClick={() => navigate('/wallet/add-nft')} variant="primary">
              {t('wallet.add_nft') || 'Adicionar NFT'}
            </Button>
          </div>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('wallet.search_nfts') || 'Buscar NFTs...'}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={<Search size={20} />}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-2" />
            {t('wallet.filters') || 'Filtros'}
            {selectedCollection && (
              <Badge variant="primary" size="sm" className="ml-2">1</Badge>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNfts}
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-sand-50 rounded-lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-matte-black-700 mb-2">
                {t('wallet.collection') || 'Coleção'}
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCollection === '' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleCollectionFilter('')}
                >
                  {t('wallet.all_collections') || 'Todas'}
                </Button>
                {collections.map(collection => (
                  <Button
                    key={collection}
                    variant={selectedCollection === collection ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleCollectionFilter(collection)}
                  >
                    {collection}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                {t('wallet.clear_filters') || 'Limpar Filtros'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-matte-black-600">
        <span>
          {filteredCount === totalCount 
            ? `${totalCount} NFTs`
            : `${filteredCount} de ${totalCount} NFTs`
          }
        </span>
        
        {selectedCollection && (
          <Badge variant="outline">
            {selectedCollection}
          </Badge>
        )}
      </div>

      {/* NFTs Grid/List */}
      {nfts.length === 0 ? (
        <EmptyState
          icon={<Search size={48} />}
          title={t('wallet.no_results') || 'Nenhum resultado encontrado'}
          description={t('wallet.try_different_search') || 'Tente uma busca diferente ou ajuste os filtros.'}
        />
      ) : (
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        }`}>
          {nfts.map((nft, index) => (
            viewMode === 'grid' ? (
              <NftCard
                key={`${nft.collection}_${nft.id}`}
                nft={nft}
                index={index}
                onClick={() => handleNftClick(nft)}
                onTransfer={() => handleTransfer(nft)}
                canTransfer={!isWatchOnly()}
              />
            ) : (
              <NftRow
                key={`${nft.collection}_${nft.id}`}
                nft={nft}
                index={index}
                onClick={() => handleNftClick(nft)}
                onTransfer={() => handleTransfer(nft)}
                canTransfer={!isWatchOnly()}
              />
            )
          ))}
        </div>
      )}

      {/* NFT Detail Modal */}
      {selectedNft && (
        <NftDetailModal
          nft={selectedNft}
          onClose={() => setSelectedNft(null)}
          onTransfer={() => handleTransfer(selectedNft)}
          canTransfer={!isWatchOnly()}
        />
      )}
    </div>
  )
}

interface NftCardProps {
  nft: NftWithMetadata
  index: number
  onClick: () => void
  onTransfer: () => void
  canTransfer: boolean
}

const NftCard: React.FC<NftCardProps> = ({ nft, index, onClick, onTransfer, canTransfer }) => {
  const { t } = useI18n()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-xl border border-sand-200 overflow-hidden hover:shadow-soft transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="aspect-square bg-sand-100 relative overflow-hidden">
        {nft.image ? (
          <img
            src={nft.image}
            alt={nft.name || `NFT #${nft.id}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling!.style.display = 'flex'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={48} className="text-matte-black-400" />
          </div>
        )}
        
        {/* Fallback */}
        <div className="w-full h-full flex items-center justify-center bg-sand-100" style={{ display: 'none' }}>
          <ImageIcon size={48} className="text-matte-black-400" />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              <Eye size={16} className="mr-2" />
              {t('wallet.view') || 'Ver'}
            </Button>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 right-2 space-y-1">
          {nft.meta?.tokenized && (
            <Badge variant="success" size="sm">
              {t('wallet.tokenized') || 'Tokenizado'}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-matte-black-900 truncate mb-1">
          {nft.name || `NFT #${nft.id}`}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" size="sm">
            {nft.collection}
          </Badge>
          <span className="text-xs text-matte-black-500">
            #{nft.id.slice(-6)}
          </span>
        </div>
        
        {canTransfer && (
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onTransfer()
            }}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Send size={14} className="mr-2" />
            {t('wallet.transfer') || 'Transferir'}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

interface NftRowProps {
  nft: NftWithMetadata
  index: number
  onClick: () => void
  onTransfer: () => void
  canTransfer: boolean
}

const NftRow: React.FC<NftRowProps> = ({ nft, index, onClick, onTransfer, canTransfer }) => {
  const { t } = useI18n()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 bg-white rounded-xl border border-sand-200 hover:shadow-soft transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 bg-sand-100 rounded-lg overflow-hidden flex-shrink-0">
          {nft.image ? (
            <img
              src={nft.image}
              alt={nft.name || `NFT #${nft.id}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling!.style.display = 'flex'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={24} className="text-matte-black-400" />
            </div>
          )}
          
          {/* Fallback */}
          <div className="w-full h-full flex items-center justify-center bg-sand-100" style={{ display: 'none' }}>
            <ImageIcon size={24} className="text-matte-black-400" />
          </div>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-matte-black-900 truncate">
            {nft.name || `NFT #${nft.id}`}
          </h3>
          
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" size="sm">
              {nft.collection}
            </Badge>
            <span className="text-xs text-matte-black-500">
              #{nft.id.slice(-6)}
            </span>
            {nft.meta?.tokenized && (
              <Badge variant="success" size="sm">
                {t('wallet.tokenized') || 'Tokenizado'}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            variant="outline"
            size="sm"
          >
            <Eye size={14} className="mr-1" />
            {t('wallet.view') || 'Ver'}
          </Button>
          
          {canTransfer && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onTransfer()
              }}
              variant="outline"
              size="sm"
            >
              <Send size={14} className="mr-1" />
              {t('wallet.transfer') || 'Transferir'}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

interface NftDetailModalProps {
  nft: NftWithMetadata
  onClose: () => void
  onTransfer: () => void
  canTransfer: boolean
}

const NftDetailModal: React.FC<NftDetailModalProps> = ({ 
  nft, 
  onClose, 
  onTransfer, 
  canTransfer 
}) => {
  const { t } = useI18n()
  
  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="aspect-square bg-sand-100 rounded-xl overflow-hidden">
            {nft.image ? (
              <img
                src={nft.image}
                alt={nft.name || `NFT #${nft.id}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={64} className="text-matte-black-400" />
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-matte-black-900 mb-2">
                {nft.name || `NFT #${nft.id}`}
              </h2>
              
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="outline">
                  {nft.collection}
                </Badge>
                <span className="text-sm text-matte-black-500">
                  #{nft.id}
                </span>
                {nft.meta?.tokenized && (
                  <Badge variant="success">
                    {t('wallet.tokenized') || 'Tokenizado'}
                  </Badge>
                )}
              </div>
              
              {nft.meta?.description && (
                <p className="text-matte-black-700">
                  {nft.meta.description}
                </p>
              )}
            </div>
            
            {/* Attributes */}
            {nft.meta?.attributes && nft.meta.attributes.length > 0 && (
              <div>
                <h3 className="font-semibold text-matte-black-900 mb-3">
                  {t('wallet.attributes') || 'Atributos'}
                </h3>
                <div className="space-y-2">
                  {nft.meta.attributes.map((attr, index) => (
                    <div key={index} className="flex justify-between p-2 bg-sand-50 rounded-lg">
                      <span className="text-sm text-matte-black-600">
                        {attr.trait_type}
                      </span>
                      <span className="text-sm font-medium text-matte-black-900">
                        {attr.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex space-x-3">
              {canTransfer && (
                <Button
                  onClick={onTransfer}
                  variant="primary"
                  className="flex-1"
                >
                  <Send size={16} className="mr-2" />
                  {t('wallet.transfer') || 'Transferir'}
                </Button>
              )}
              
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                {t('common.close') || 'Fechar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}