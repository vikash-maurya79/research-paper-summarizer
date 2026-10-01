export interface SamplePaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  conference: string;
  tag: string;
  text: string;
}

export const SAMPLE_PAPERS: SamplePaper[] = [
  {
    id: 'transformer',
    title: 'Attention Is All You Need',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, et al.',
    year: 2017,
    conference: 'NeurIPS 2017',
    tag: 'NLP / Architecture',
    text: `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.

Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature.

Methodology:
The Transformer follows an overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder. Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions. Positional encodings based on sine and cosine functions of different frequencies are added to input embeddings. We trained on the standard WMT 2014 English-German dataset consisting of 4.5 million sentence pairs, and WMT 2014 English-French dataset with 36 million sentences. Models were trained on 8 NVIDIA P100 GPUs using the Adam optimizer with beta1=0.9, beta2=0.98 and eps=10^-9.

Limitations:
For sequence lengths much longer than typical sentences, computing full self-attention scales quadratically O(N^2) in memory and computation with respect to sequence length, causing substantial memory consumption on very long context windows. The architecture also lacks inductive biases for sequential locality inherent to recurrent and convolutional layers, requiring substantial training data to learn positional relationships from scratch.`,
  },
  {
    id: 'lora',
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    authors: 'Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, et al.',
    year: 2021,
    conference: 'ICLR 2022',
    tag: 'PEFT / LLM',
    text: `An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to particular tasks or domains. As we pre-train larger models, full fine-tuning, which retrains all model parameters, becomes less feasible. Using GPT-3 175B as an example - deploying independent instances of fine-tuned models, each with 175B parameters, is prohibitive.

We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks. Compared to fine-tuning with Adam, LoRA can reduce the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times.

Methodology:
For a pre-trained weight matrix W0 in R^{d x k}, LoRA constrains its update Delta W by representing the latter with a low-rank decomposition Delta W = B * A, where B in R^{d x r} and A in R^{r x k}, with rank r << min(d, k). During training, W0 is frozen and receives no gradient updates, while A and B contain trainable parameters. We apply LoRA to Transformer self-attention projection matrices (W_q, W_v). We evaluate LoRA on RoBERTa, DeBERTa, and GPT-2, as well as GPT-3 175B, across GLUE benchmark tasks, E2E NLG Challenge, and WebNLG.

Findings:
On GPT-3 175B, LoRA matches or exceeds the performance of full fine-tuning across all benchmarks while using only 37.7M trainable parameters compared to 175,255.8M (a 4,648x parameter reduction). GPU memory consumption is lowered from 1.2TB to 350GB during training. LoRA introduces no additional inference latency compared to full fine-tuning because the adapter matrices B*A can be explicitly folded into W0 during inference deployment.

Limitations:
LoRA is not straightforward to batch across different tasks with different rank adapters in a single forward pass without incurring latency overhead when merging weights on the fly. Furthermore, determining the optimal rank r and target weight matrices requires empirical hyperparameter search for differing downstream modalities.`,
  },
  {
    id: 'flashattention',
    title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    authors: 'Tri Dao, Daniel Y. Fu, Stefano Ermon, Atri Rudra, Christopher Ré',
    year: 2022,
    conference: 'NeurIPS 2022',
    tag: 'Hardware / Efficiency',
    text: `Transformers are slow and memory-hungry on long sequences, as the time and memory complexity of self-attention are quadratic in sequence length. Approximate attention methods have attempted to address this by trading off model quality to reduce compute complexity, but often do not achieve wall-clock speedups.

We argue that a missing principle is making attention algorithms IO-aware—accounting for reads and writes between levels of GPU memory (fast SRAM and slow HBM). We propose FlashAttention, an IO-aware exact attention algorithm that uses tiling to reduce the number of memory reads/writes between GPU high bandwidth memory (HBM) and GPU on-chip SRAM.

Methodology:
FlashAttention computes exact standard softmax attention without approximation by splitting the input matrices Q, K, V into blocks, loading them from slow HBM into fast SRAM, computing attention relative to that block, and scaling the intermediate values using online softmax normalization before writing back to HBM. We also implement a backward pass that recomputes intermediate attention matrices on chip during backpropagation rather than storing the N x N attention matrix in HBM. Evaluated on GPT-2 (small/medium/large), BERT-large, and long-range arena (LRA) benchmark up to 4K sequence lengths on NVIDIA A100 GPUs.

Findings:
FlashAttention trains Transformers faster than existing baselines: 15% end-to-end wall-clock speedup on BERT-large (seq length 512) compared to MLPerf 1.1 record, 3x speedup on GPT-2 (seq length 1K), and 2.4x speedup on long-document classification (seq length 4K). It reduces memory footprint from quadratic O(N^2) to linear O(N) in sequence length, enabling 512 to 64K context extensions with zero approximation error.

Limitations:
FlashAttention requires custom low-level CUDA and Triton kernel programming, making implementation across non-NVIDIA accelerators (e.g. TPUs or custom ASICs) non-trivial. Furthermore, on very short sequences (e.g. < 128 tokens) where computation is compute-bound rather than memory bandwidth-bound, IO optimization yields minimal wall-clock speedups.`,
  },
  {
    id: 'resnet',
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun',
    year: 2016,
    conference: 'CVPR 2016 (Best Paper)',
    tag: 'Computer Vision',
    text: `Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth.

Methodology:
Instead of hoping each few stacked layers directly fit a desired underlying mapping H(x), we explicitly let these layers approximate a residual mapping F(x) := H(x) - x. The original mapping is recast into F(x) + x, realized by feedforward neural networks with identity shortcut connections. Identity shortcuts require neither extra parameters nor computation complexity. We evaluate residual networks with up to 152 layers on ImageNet 2012 classification dataset (1.28 million training images, 50,000 validation images across 1,000 classes), CIFAR-10, and COCO object detection. Models were trained using SGD with mini-batch size 256, momentum 0.9, and weight decay 0.0001.

Findings:
On the ImageNet test set, our 152-layer ResNet achieves a 3.57% top-5 error rate, winning 1st place in the ILSVRC 2015 classification competition. Extremely deep 152-layer networks can be optimized without degradation, exhibiting lower training error than 34-layer plain nets. On COCO object detection, ResNet obtains a 28% relative improvement on mAP, also winning 1st place in ImageNet detection, ImageNet localization, COCO detection, and COCO segmentation tasks.`,
  },
  {
    id: 'abstract_no_limitations',
    title: 'Test Case: Abstract with No Limitations Discussed',
    authors: 'Academic Benchmarking Group',
    year: 2024,
    conference: 'Synthetic Benchmark',
    tag: 'Validation Test',
    text: `We investigate the impact of sparse mixture-of-experts (MoE) routing algorithms on numerical stability during large-scale pre-training. We introduce Top-2-Normalized Router, a routing policy that enforces hard unit-norm scaling across expert gate weights prior to softmax dispatch.

Methodology:
Experiments were conducted on a 7B active parameter MoE model with 8 total experts across 300 billion tokens of C4 and Wikipedia data. The architecture utilizes SwiGLU activation functions and Rotary Position Embeddings (RoPE), trained on a cluster of 64 H100 GPUs using Megatron-LM with mixed precision FP8.

Findings:
The Top-2-Normalized routing policy completely eliminated gradient overflow spikes across the entire 300B token training run, achieving a final validation perplexity of 8.42 compared to 8.79 for standard top-2 gating. Training throughput improved by 4.2% due to reduced re-computation from stability resets.`,
  },
];
